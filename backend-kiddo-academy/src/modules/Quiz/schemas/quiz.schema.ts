// src/quiz/schemas/quiz.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Option {
    @Prop({ required: true })
    label: 'A' | 'B' | 'C' | 'D';

    @Prop({ required: true })
    content: string; // texte ou URL image

    @Prop({ required: true, enum: ['text', 'image'] })
    type: 'text' | 'image';
}

@Schema()
export class Question {
    @Prop({ required: true })
    content: string; // texte ou image

    @Prop({ required: true, enum: ['text', 'image'] })
    type: 'text' | 'image';

    @Prop({ type: [Option], required: true })
    options: Option[];

    @Prop({ required: true })
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

@Schema({ timestamps: true })
export class Quiz extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Story', required: true })
    storyId: Types.ObjectId; // C'est le lien vers l'histoire !

    @Prop({ type: [Question], required: true })
    questions: Question[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);