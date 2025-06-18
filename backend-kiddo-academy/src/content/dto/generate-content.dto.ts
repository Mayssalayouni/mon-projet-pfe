// src/content-generator/dto/generate-content.dto.ts

import { IsString, IsInt, Min, Max, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer'; // <--- Make sure this is imported if explicitly used, though global transform handles it

export class CreateContentDto {
  @IsInt() // Ensures it's an integer
  @Min(4)   // Ensures it's not less than 4
  @Max(6)   // Ensures it's not greater than 6
  @Type(() => Number) // Explicitly tells class-transformer to convert to Number, often redundant with global transform:true but good for clarity/debugging
  gradeLevel: number; // <--- Must be 'number' type

  @IsInt()
  // Max values will be dynamically controlled by frontend logic based on gradeLevel
  // The @Max is a fallback for validation, but the prompt will truly guide the AI
  @Min(1)
  @Max(7) // Max units for 6th grade
  @IsNotEmpty()
  unitNumber: number; // e.g., 1, 2, 3...

  @IsInt()
  // Max values will be dynamically controlled by frontend logic based on gradeLevel
  @Min(1)
  @Max(5) // Max lessons for 6th grade
  @IsNotEmpty()
  lessonNumber: number; // e.g., 1, 2, 3...

  @IsString()
  @IsNotEmpty()
  storyTopic: string;

  // We can derive or adjust these based on gradeLevel, unit, and lesson if needed
  // For now, keep them for fine-tuning by the user, or remove if you want full automation
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional() // Make optional as it might be derived
  complexityLevel?: number; // 1=very simple, 5=very complex

  @IsString()
  @IsIn(['simple', 'intermediate', 'advanced'])
  @IsOptional() // Make optional as it might be derived
  difficultyDegree?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  numberOfStoryParagraphs: number;

  @IsInt()
  @Min(1)
  @Max(10)
  numberOfQuizQuestions: number;
}