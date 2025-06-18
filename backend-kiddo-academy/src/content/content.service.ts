import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

import { CreateContentDto } from './dto/generate-content.dto';
import { GenerateQuizRequestDto } from '../modules/Quiz/dto/generate-quiz-request.dto';

export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'open_ended';
  options?: string[];
  correct_answer: string;
}

export interface GeneratedContent {
  titleStory: string; // <-- ADDED: This attribute was added to the interface
  story: string;
  quiz: QuizQuestion[];
}

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  }

  /**
   * Builds the AI prompt for generating educational story content, a title, and a quiz.
   * Tailored for Tunisian primary school English program.
   */
  private buildPrompt(dto: CreateContentDto): string {
    let complexityDescription = '';
    let difficultyDescription = '';
    let expectedParagraphsSuggestion = '';
    let expectedQuestionsSuggestion = '';

    switch (dto.gradeLevel) {
      case 4:
        complexityDescription = 'very simple, suitable for 4th graders (ages 9-10). Use basic sentence structures.';
        difficultyDescription = 'simple English vocabulary and grammar, avoiding complex idioms.';
        expectedParagraphsSuggestion = 'around 2-3 paragraphs';
        expectedQuestionsSuggestion = 'around 3-5 questions';
        break;
      case 5:
        complexityDescription = 'simple to intermediate, suitable for 5th graders (ages 10-11). Use clear and mostly simple sentences.';
        difficultyDescription = 'intermediate English vocabulary and grammar, may include very common simple phrasal verbs.';
        expectedParagraphsSuggestion = 'around 3-5 paragraphs';
        expectedQuestionsSuggestion = 'around 4-6 questions';
        break;
      case 6:
        complexityDescription = 'intermediate to slightly complex, suitable for 6th graders (ages 11-12). Can use slightly more varied sentence structures.';
        difficultyDescription = 'advanced English vocabulary and grammar for primary level, possibly including some common idioms.';
        expectedParagraphsSuggestion = 'around 4-7 paragraphs';
        expectedQuestionsSuggestion = 'around 5-8 questions';
        break;
      default:
        complexityDescription = 'general complexity';
        difficultyDescription = 'general difficulty';
        expectedParagraphsSuggestion = 'a reasonable number of paragraphs';
        expectedQuestionsSuggestion = 'a reasonable number of questions';
        break;
    }

    const finalComplexity = dto.complexityLevel ? `${dto.complexityLevel} (user specified value)` : complexityDescription;
    const finalDifficulty = dto.difficultyDegree || difficultyDescription;

    return `
Génère une histoire en anglais, un titre pour l'histoire, et un quiz pour le programme scolaire tunisien.
**Contexte Scolaire:**
  - **Classe:** ${dto.gradeLevel}th Grade Primary School (Tunisia)
  - **Unité:** Unit ${dto.unitNumber}
  - **Leçon:** Lesson ${dto.lessonNumber}
**Contenu Demandé:**
  - **Sujet de l'histoire:** ${dto.storyTopic}
  - **Niveau de complexité générale de l'histoire/quiz:** ${finalComplexity}
  - **Degré de difficulté du vocabulaire/grammaire:** ${finalDifficulty}
  - **Nombre de paragraphes de l'histoire (strict):** ${dto.numberOfStoryParagraphs} (La longueur attendue pour cette classe est ${expectedParagraphsSuggestion})
  - **Nombre de questions du quiz (strict):** ${dto.numberOfQuizQuestions} (Le nombre attendu pour cette classe est ${expectedQuestionsSuggestion})

IMPORTANT: La sortie DOIT être un objet JSON valide et uniquement cela. Ne pas inclure d'explications ou de texte avant ou après le JSON.
Le format JSON attendu est le suivant :
{
  "titleStory": "Le titre de l'histoire ici (doit être généré)", // <-- MODIFIED: Added this key to the expected JSON output
  "story": "Le texte complet de l'histoire ici, divisé en EXACTEMENT ${dto.numberOfStoryParagraphs} paragraphes. Chaque paragraphe doit être séparé par un double saut de ligne (\\n\\n).",
  "quiz": [
    {
      "question": "Texte de la question 1 ?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "La bonne réponse (texte de l'option ou réponse pour open_ended)"
    }
    // ... ajoutez ${dto.numberOfQuizQuestions - 1 > 0 ? `${dto.numberOfQuizQuestions - 1} autres questions` : 'aucune autre question'} ici, pour un total de ${dto.numberOfQuizQuestions} questions.
  ]
}

Assure-toi que :
- L'histoire est en anglais et est **parfaitement adaptée aux élèves de ${dto.gradeLevel}ème année primaire en Tunisie**, en tenant compte de leur âge et de leur niveau de langue.
- Le **titre de l'histoire ('titleStory') est pertinent** au sujet et à l'histoire générée, et adapté au niveau de la classe. // <-- ADDED: Explicit instruction for the AI to generate a relevant title
- Le vocabulaire et la grammaire de l'histoire et du quiz correspondent au **degré de difficulté '${finalDifficulty}'** et au **niveau de complexité '${finalComplexity}'** spécifiés.
- L'histoire est cohérente avec le sujet, et a **EXACTEMENT ${dto.numberOfStoryParagraphs} paragraphes**.
- Le quiz contient **EXACTEMENT ${dto.numberOfQuizQuestions} questions**, pertinentes à l'histoire et adaptées au niveau de la classe.
- Pour les questions à choix multiples, fournis 3 ou 4 options et indique la bonne réponse. Si le type est "open_ended", le champ "options" ne doit pas exister.
- Pour les questions ouvertes, fournis la réponse attendue.
- Le JSON est correctement formaté, sans commentaires ni texte superflu.
`;
  }

  /**
   * Generates educational content (story, title, and quiz) based on CreateContentDto.
   */
  async generateContent(createContentDto: CreateContentDto): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(createContentDto);
    this.logger.log(`Sending prompt to Gemini for full content: ${prompt.substring(0, 300)}...`);

    try {
      const generationConfig = {
        responseMimeType: "application/json",
      };

      // Safety settings for content generation
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const responseText = result.response.text();
      this.logger.log(`Received response from Gemini (first 300 chars): ${responseText.substring(0, 300)}...`);

      // Clean the JSON string from markdown fences if Gemini still adds them
      let cleanedJsonString = responseText.trim();
      if (cleanedJsonString.startsWith('```json')) {
        cleanedJsonString = cleanedJsonString.substring(7);
      }
      if (cleanedJsonString.endsWith('```')) {
        cleanedJsonString = cleanedJsonString.substring(0, cleanedJsonString.length - 3);
      }
      cleanedJsonString = cleanedJsonString.trim();

      const parsedResponse: GeneratedContent = JSON.parse(cleanedJsonString);

      // Basic validation of the parsed content structure, including the new titleStory
      if (!parsedResponse.titleStory || typeof parsedResponse.titleStory !== 'string') { // <-- ADDED: Validation for titleStory
        this.logger.error('Invalid JSON structure received from AI. Missing or invalid titleStory.', parsedResponse);
        throw new Error('Invalid JSON structure received from AI: Missing or invalid titleStory.');
      }
      if (!parsedResponse.story || !parsedResponse.quiz) {
        this.logger.error('Invalid JSON structure received from AI. Missing story or quiz.', parsedResponse);
        throw new Error('Invalid JSON structure received from AI.');
      }
      if (!Array.isArray(parsedResponse.quiz)) {
        this.logger.error('Invalid JSON structure: quiz is not an array.', parsedResponse);
        throw new Error('Invalid JSON structure: quiz is not an array.');
      }
      // Warn if quiz question count doesn't match requested, but proceed
      if (parsedResponse.quiz.length !== createContentDto.numberOfQuizQuestions) {
        this.logger.warn(`AI returned ${parsedResponse.quiz.length} questions, but ${createContentDto.numberOfQuizQuestions} were requested. Using AI provided count.`);
      }
      // Validate structure of each quiz question
      for (const q of parsedResponse.quiz) {
        if (typeof q.question !== 'string' || typeof q.type !== 'string' || typeof q.correct_answer !== 'string') {
          this.logger.error('Invalid quiz question structure from AI. Missing question, type, or correct_answer.', q);
          throw new Error('Invalid quiz question structure from AI.');
        }
        if (q.type === 'multiple_choice' && (!Array.isArray(q.options) || q.options.some(opt => typeof opt !== 'string'))) {
          this.logger.error('Invalid multiple_choice question options from AI.', q);
          throw new Error('Invalid multiple_choice question options from AI.');
        }
        if (q.type === 'open_ended' && q.options !== undefined) {
          this.logger.warn('Open_ended question from AI unexpectedly contains options field. Removing options.', q);
          delete q.options; // Attempt to correct by removing unexpected options
        }
      }

      return parsedResponse;

    } catch (error) {
      this.logger.error('Error generating content with Gemini:', error);
      if (error.message.includes('JSON.parse')) {
        this.logger.error('Response from Gemini was not valid JSON or cleaning failed. Raw response:', error['rawResponse'] || 'Not available');
      } else if (error.response && error.response.promptFeedback) {
        this.logger.error('Prompt Feedback:', error.response.promptFeedback);
      }
      throw new HttpException(
        `Failed to generate content: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates only a quiz based on provided paragraphs and parameters.
   */
  async generateOnlyQuiz(dto: GenerateQuizRequestDto): Promise<QuizQuestion[]> {
    const paragraphsText = dto.paragraphs.join('\n\n');

    // You now have dto.gradeLevel, dto.complexity, dto.difficulty available
    // You can use these to create more precise instructions for the AI
    const complexityDescription = `(on a scale of 1-5, ${dto.complexity} being the complexity for this quiz)`;
    const difficultyDescription = `(e.g., '${dto.difficulty}' vocabulary and grammar)`;

    const prompt = `
      Génère un quiz en anglais basé sur le texte suivant :
      ---
      ${paragraphsText}
      ---

      **Contexte Scolaire pour le Quiz:**
        - **Sujet du quiz:** ${dto.topic}
        - **Classe Cible:** ${dto.gradeLevel}th Grade Primary School (Tunisia)
        - **Niveau de complexité du quiz:** ${dto.complexity} ${complexityDescription}
        - **Degré de difficulté du vocabulaire/grammaire du quiz:** ${dto.difficulty} ${difficultyDescription}
        - **Nombre de questions du quiz (strict):** ${dto.numberOfQuestions}

      IMPORTANT: La sortie DOIT être un tableau JSON d'objets quiz, et uniquement cela. Ne pas inclure d'explications ou de texte avant ou après le JSON.
      Le format JSON attendu est le suivant :
      [
        {
          "question": "Texte de la question 1 ?",
          "type": "multiple_choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "La bonne réponse (texte de l'option ou réponse pour open_ended)"
        }
        // ... ajoutez ${dto.numberOfQuestions - 1 > 0 ? `${dto.numberOfQuestions - 1} autres questions` : 'aucune autre question'} ici, pour un total de ${dto.numberOfQuestions} questions.
      ]
      Assure-toi que :
      - Le quiz contient **EXACTEMENT ${dto.numberOfQuestions} questions**.
      - Chaque question est pertinente **au texte des paragraphes fournis** et **adaptée au niveau de la classe (${dto.gradeLevel}ème année), à la complexité (${dto.complexity}) et à la difficulté (${dto.difficulty}) spécifiées**.
      - Pour les questions à choix multiples, fournis 3 ou 4 options et indique la bonne réponse. Si le type est "open_ended", le champ "options" ne doit pas exister.
      - Pour les questions ouvertes, fournis la réponse attendue.
      - Le JSON est correctement formaté, sans commentaires ni texte superflu.
    `;
    this.logger.log(`Sending prompt to Gemini for quiz only: ${prompt.substring(0, 300)}...`);

    try {
      const generationConfig = { responseMimeType: "application/json" };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const responseText = result.response.text();
      this.logger.log(`Received quiz only response (first 300 chars): ${responseText.substring(0, 300)}...`);

      let cleanedJsonString = responseText.trim();
      if (cleanedJsonString.startsWith('```json')) {
        cleanedJsonString = cleanedJsonString.substring(7);
      }
      if (cleanedJsonString.endsWith('```')) {
        cleanedJsonString = cleanedJsonString.substring(0, cleanedJsonString.length - 3);
      }
      cleanedJsonString = cleanedJsonString.trim();

      const parsedResponse: QuizQuestion[] = JSON.parse(cleanedJsonString);

      if (!Array.isArray(parsedResponse)) {
        this.logger.error('Invalid JSON structure received from AI: quiz is not an array.', parsedResponse);
        throw new Error('Invalid JSON structure received from AI: quiz is not an array.');
      }

      // Validation of quiz questions
      for (const q of parsedResponse) {
        if (typeof q.question !== 'string' || typeof q.type !== 'string' || typeof q.correct_answer !== 'string') {
          this.logger.error('Invalid quiz question structure from AI. Missing question, type, or correct_answer.', q);
          throw new Error('Invalid quiz question structure from AI.');
        }
        if (q.type === 'multiple_choice' && (!Array.isArray(q.options) || q.options.some(opt => typeof opt !== 'string'))) {
          this.logger.error('Invalid multiple_choice question options from AI.', q);
          throw new Error('Invalid multiple_choice question options from AI.');
        }
        if (q.type === 'open_ended' && q.options !== undefined) {
          this.logger.warn('Open_ended question from AI unexpectedly contains options field. Removing options.', q);
          delete q.options; // Try to correct
        }
      }

      return parsedResponse;
    } catch (error) {
      this.logger.error('Error generating only quiz with Gemini:', error);
      if (error.message.includes('JSON.parse')) {
        this.logger.error('Response from Gemini was not valid JSON or cleaning failed. Raw response:', error['rawResponse'] || 'Not available');
      } else if (error.response && error.response.promptFeedback) {
        this.logger.error('Prompt Feedback:', error.response.promptFeedback);
      }
      throw new HttpException(
        `Failed to generate quiz: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}