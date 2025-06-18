export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'open_ended';
  options?: string[];
  correct_answer: string;
}

export interface GeneratedContent {
  titleStory: string;
  story: string;
  quiz: QuizQuestion[];
}