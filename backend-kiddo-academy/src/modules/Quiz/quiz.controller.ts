// src/quiz/quiz.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Controller('quizzes')
export class QuizController {
    constructor(private quizService: QuizService) {}

    @Post()
    create(@Body() dto: CreateQuizDto) {
        return this.quizService.create(dto);
    }

    @Get()
    findByStory(@Query('storyId') storyId: string) {
        return this.quizService.findByStory(storyId);
    }
}