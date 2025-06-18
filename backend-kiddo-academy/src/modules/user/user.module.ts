import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Parent, ParentSchema } from './schemas/parent.schema';
import { Etablissement, EtablissementSchema } from './schemas/etablissement.schema';
import { Enfant, EnfantSchema } from '../enfants/schemas/enfant.schemas'; // Import du modèle Enfant
import { Admin, AdminSchema } from './schemas/admin.schema';
import { EnfantService } from '../enfants/enfant.service'; // Ajout du service enfant
import { EnfantController } from '../enfants/Enfant.controller'; // Ajout du contrôleur enfant
import { Enseignant, EnseignantSchema } from '../enseignant/schemas/enseignant.schema' // <<< Make sure this import is correct
import { StoryService } from '../story/story.service';
import { QuizService } from '../Quiz/quiz.service';
import { StoryController } from '../story/story.controller';
import { QuizController } from '../Quiz/quiz.controller';
import { Story, StorySchema } from '../story/schemas/story.schema' // <<< Make sure this import is correct
import { Quiz, QuizSchema } from '../Quiz/schemas/quiz.schema'
import { OpenAIService } from '../../openai/openai.service';
import { OpenAIModule } from '../../openai/openai.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Parent', schema: ParentSchema },
      { name: 'Etablissement', schema: EtablissementSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'Enfant', schema: EnfantSchema }, // Ajout de Enfant dans la BDD
      { name: Enseignant.name, schema: EnseignantSchema },
     
    ]),
    JwtModule.register({
      secret: 'KiddoAcademy',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, EnfantService ], // Ajout du service enfant
  controllers: [UserController, EnfantController], // Ajout du contrôleur enfant
})
export class UserModule { }
