import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Story, StorySchema } from './schemas/story.schema';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { Enfant, EnfantSchema } from '../enfants/schemas/enfant.schemas';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Enseignant, EnseignantSchema } from '../enseignant/schemas/enseignant.schema'; // Import Enseignant
import { Etablissement, EtablissementSchema } from '../user/schemas/etablissement.schema'; // Import Etablissement
import { QuizController } from '../Quiz/quiz.controller';
import { Quiz, QuizSchema } from '../Quiz/schemas/quiz.schema'
import { QuizService } from '../Quiz/quiz.service';
import { OpenAIService } from '../../openai/openai.service';
import { OpenAIModule } from '../../openai/openai.module';
@Module({
  imports: [
    OpenAIModule,
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Enfant.name, schema: EnfantSchema },
      { name: User.name, schema: UserSchema },
      { name: Enseignant.name, schema: EnseignantSchema }, // Register Enseignant model
      { name: Etablissement.name, schema: EtablissementSchema }, // Register Etablissement model
    ]),
    JwtModule.register({
      secret: 'KiddoAcademy',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [StoryService, QuizService, OpenAIService],
  controllers: [StoryController, QuizController],
})
export class StoryModule { }
