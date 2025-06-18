// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ImageGenerationModule } from './image-generation/image-generation.module';

// Importez vos vrais modules
import { UserModule } from './modules/user/user.module'; // Assurez-vous que le chemin est correct
import { ContentGeneratorModule } from './content/content.module'; // Assurez-vous que le chemin est correct
import { TranslateModule } from './translate/translate.module';

import { StoryModule } from './modules/story/story.module';
// import { QuizService } from './modules/Quiz/quiz.service';
// Supprimez les placeholders si les modules réels sont importés
// @Module({ imports: [], controllers: [], providers: []})
// export class UserModule {}
// @Module({ imports: [], controllers: [], providers: []})
// export class ContentGeneratorModule {}


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/kiddoacademydb'),
    UserModule,
    ContentGeneratorModule,     // Utilise le ContentGeneratorModule importé
    ImageGenerationModule,
    TranslateModule,
    StoryModule,
    JwtModule.register({
      secret: 'KiddoAcademy',
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

  ],
})
export class AppModule { }