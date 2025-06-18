// src/stories/schemas/story.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Paragraph {
    @Prop({ required: true })
    text: string;

    @Prop()
    image?: string;
}

export const ParagraphSchema = SchemaFactory.createForClass(Paragraph);

@Schema({ timestamps: true })
export class Story extends Document {
    @Prop({ required: true })
    storyTopic: string;

    @Prop() 
    titleStory?: string; 
    
    @Prop({ required: true })
    complexityLevel: number;

    @Prop({ required: true })
    difficultyDegree: string;

    @Prop({ type: [ParagraphSchema], required: true })
    paragraphs: Paragraph[];

    @Prop()
    poster?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    responsableId: Types.ObjectId;

    @Prop({ enum: ['parent', 'etablissement', 'admin', 'teacher'], required: true })
    userRole: string;

    // --- NEW FIELDS TO ADD ---
    @Prop({ required: true })
    gradeLevel: number; // For the story's grade level

    @Prop({ required: true })
    unitNumber: number; // For the story's unit number

    @Prop({ required: true })
    lessonNumber: number; // For the story's lesson number

    @Prop({ required: true })
    numberOfStoryParagraphs: number; // The requested number of paragraphs during generation

    @Prop({ required: true })
    numberOfQuizQuestions: number; // The requested number of quiz questions during generation
    // --- END NEW FIELDS ---
}

export const StorySchema = SchemaFactory.createForClass(Story);