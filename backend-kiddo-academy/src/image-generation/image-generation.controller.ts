import { Controller, Post, Body } from '@nestjs/common';
import { ImageGenerationService } from './image-generation.service';

@Controller('image-generation')
export class ImageGenerationController {
  constructor(private readonly imageGenerationService: ImageGenerationService) {}

  @Post('dalle')
  async generateImage(@Body() body: { prompt: string; aspectRatio?: string; numberImages?: number }) {
    return this.imageGenerationService.generateImageWithDalle(body);
  }
}
