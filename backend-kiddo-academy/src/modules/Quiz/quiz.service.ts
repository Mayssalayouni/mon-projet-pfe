// src/quiz/quiz.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz } from './schemas/quiz.schema';
import { Model, Types } from 'mongoose'; // Importe Types si tu en as besoin explicitement
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizService {
    constructor(@InjectModel(Quiz.name) private quizModel: Model<Quiz>) {}

    async create(dto: CreateQuizDto): Promise<Quiz> {
        // Mongoose convertira automatiquement storyId string en ObjectId si le schéma l'attend.
        // Si tu as besoin d'une conversion explicite ici, tu pourrais faire :
        // const quizToCreate = { ...dto, storyId: new Types.ObjectId(dto.storyId) };
        // return this.quizModel.create(quizToCreate);
        return this.quizModel.create(dto); // Cela devrait fonctionner directement
    }

    async findByStory(storyId: string): Promise<Quiz[]> {
        return this.quizModel.find({ storyId }).exec();
    }
}