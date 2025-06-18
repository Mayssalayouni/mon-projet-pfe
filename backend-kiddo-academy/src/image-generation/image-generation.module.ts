// src/image-generation/image-generation.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { ImageGenerationController } from './image-generation.controller';
import { ImageGenerationService } from './image-generation.service';

@Module({
  imports: [
    ConfigModule, // Rendre ConfigService disponible pour ImageGenerationService
  ],
  controllers: [ImageGenerationController],
  providers: [ImageGenerationService],
})
export class ImageGenerationModule {}