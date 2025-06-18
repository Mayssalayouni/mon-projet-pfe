import { Controller, Post, Body, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ContentGeneratorService, GeneratedContent, QuizQuestion } from './content.service';
import { CreateContentDto } from './dto//generate-content.dto';
import { GenerateQuizRequestDto } from '../modules/Quiz/dto/generate-quiz-request.dto';
import { AuthGuard } from '../modules/user/JWT/auth.guard';

@Controller('content-generator')
export class ContentGeneratorController {
  constructor(private readonly contentGeneratorService: ContentGeneratorService) {}

  @Post('generate')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async generateEducationalContent(
    @Body() createContentDto: CreateContentDto
  ): Promise<GeneratedContent> {
    return this.contentGeneratorService.generateContent(createContentDto);
  }

  @UseGuards(AuthGuard)
  @Post('generate-quiz') // This route corresponds to handleGenerateQuiz on frontend
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async generateOnlyQuiz(
    @Body() generateQuizRequestDto: GenerateQuizRequestDto
  ): Promise<QuizQuestion[]> {
    // Pass the DTO instance directly to the service method
    const generatedQuiz = await this.contentGeneratorService.generateOnlyQuiz(generateQuizRequestDto);
    return generatedQuiz;
  }
}