// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common'; // Importer Logger
import * as express from 'express';
import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap'); // Créer une instance de Logger

  // Activer la validation globale pour les DTOs
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,             // Supprime les propriétés non définies dans le DTO
  //   forbidNonWhitelisted: true,  // Renvoie une erreur si des propriétés non whitelisted sont présentes
  //   transform: true,             // Transforme les payloads en instances de DTO typées
  //   transformOptions: {
  //     enableImplicitConversion: true, // Permet la conversion implicite des types (ex: string de query param en number)
  //   },
  // }));

  // Augmenter la taille de la charge utile (payload) pour les requêtes JSON et URL-encodées
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors(); // Active CORS pour permettre les requêtes depuis le frontend
  // app.use('/images', express.static(path.join(__dirname, '../uploads')));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();