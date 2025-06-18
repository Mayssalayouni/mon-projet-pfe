// src/stories/dto/create-story.dto.ts
import { IsMongoId, IsString, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class ParagraphDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsOptional()
    image?: string;
}

export class CreateStoryDto {
    @IsString()
    @IsNotEmpty()
    storyTopic: string;

    @IsString() 
    @IsOptional() 
    titleStory?: string; 

    @IsNumber()
    @IsNotEmpty()
    @IsInt() // Ensure it's an integer
    @Min(1)   // Assuming complexity is 1-5
    @Max(5)
    @Type(() => Number) // Ensure transformation from string to number
    complexityLevel: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['simple', 'intermediate', 'advanced']) // Enforce specific values
    difficultyDegree: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ParagraphDto)
    paragraphs: ParagraphDto[];

    @IsString()
    @IsOptional()
    poster?: string;

    // `responsableId` will be set by the backend based on the authenticated user
    @IsMongoId()
    @IsOptional() // This is optional in DTO because it's populated by controller
    responsableId?: Types.ObjectId;

    // `userRole` will be set by the backend based on the authenticated user
    @IsString()
    @IsNotEmpty()
    @IsIn(['parent', 'etablissement', 'admin', 'teacher'])
    @IsOptional() // This is optional in DTO because it's populated by controller
    userRole?: 'parent' | 'etablissement' | 'admin' | 'teacher';

    @IsInt()
    @Min(4)
    @Max(6)
    @IsNotEmpty()
    @Type(() => Number)
    gradeLevel: number;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    @Type(() => Number)
    unitNumber: number;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    @Type(() => Number)
    lessonNumber: number;

    @IsInt()
    @Min(1)
    @Max(10) // Assuming max 10 paragraphs
    @IsNotEmpty()
    @Type(() => Number)
    numberOfStoryParagraphs: number;

    @IsInt()
    @Min(1)
    @Max(10) // Assuming max 10 quiz questions
    @IsNotEmpty()
    @Type(() => Number)
    numberOfQuizQuestions: number;
    // --- END NEW FIELDS ---
}