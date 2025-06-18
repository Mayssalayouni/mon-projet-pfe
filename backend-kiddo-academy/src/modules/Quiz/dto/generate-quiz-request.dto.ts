// src/modules/Quiz/dto/generate-quiz-request.dto.ts

import { IsString, IsInt, Min, Max, IsIn, IsNotEmpty, IsArray } from 'class-validator';

export class GenerateQuizRequestDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  paragraphs: string[];

  @IsString()
  @IsNotEmpty()
  topic: string; // The overall topic of the content

  @IsInt()
  @Min(4)
  @Max(6)
  @IsNotEmpty()
  gradeLevel: number; 

  @IsInt() // <--- Add this for complexity
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  complexity: number; // Add complexity

  @IsString()
  @IsIn(['simple', 'intermediate', 'advanced'])
  @IsNotEmpty()
  difficulty: string; // Add difficulty

  @IsInt()
  @Min(1)
  @Max(10)
  numberOfQuestions: number;
}