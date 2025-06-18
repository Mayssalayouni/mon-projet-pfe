// src/quiz/dto/create-quiz.dto.ts
import { IsMongoId, IsArray, ValidateNested, IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
    @IsIn(['A', 'B', 'C', 'D'])
    @IsNotEmpty()
    label: 'A' | 'B' | 'C' | 'D';

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsIn(['text', 'image'])
    @IsNotEmpty()
    type: 'text' | 'image';
}

export class QuestionDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsIn(['text', 'image'])
    @IsNotEmpty()
    type: 'text' | 'image';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options: OptionDto[];

    @IsIn(['A', 'B', 'C', 'D'])
    @IsNotEmpty()
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export class CreateQuizDto {
    @IsMongoId()
    @IsNotEmpty() // storyId est requis lors de la création d'un quiz
    storyId: string; // Garder comme string ici pour le DTO, Mongoose convertira en ObjectId
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}