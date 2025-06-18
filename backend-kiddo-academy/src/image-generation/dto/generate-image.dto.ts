// src/image-generation/dto/generate-image-api.dto.ts
import { IsString, IsOptional, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class GenerateImageApiDto {
  @IsString({ message: 'Prompt must be a string.' })
  @IsNotEmpty({ message: 'Prompt cannot be empty.' })
  @MaxLength(1000, { message: 'Prompt cannot exceed 1000 characters.'}) // Limite ajoutée
  prompt: string;

  @IsOptional()
  @IsString({ message: 'Aspect ratio must be a string.' })
  @IsIn(['1:1', '16:9', '9:16', '4:3', '3:4'], { message: 'Invalid aspect ratio. Must be one of: 1:1, 16:9, 9:16, 4:3, 3:4' })
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}