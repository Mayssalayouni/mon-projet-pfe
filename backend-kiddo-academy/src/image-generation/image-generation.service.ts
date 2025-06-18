import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { error } from 'console';

interface GenerateImagePayload {
  prompt: string;
  aspectRatio?: string;    // Exemple: '1:1', '16:9', etc.
  numberImages?: number;   // Nombre d’images demandées
}
type OpenAIImageSize =
  | "1024x1024"
  | "256x256"
  | "512x512";

@Injectable()
export class ImageGenerationService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(ImageGenerationService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('La clé OPENAI_API_KEY est manquante');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateImageWithDalle(payload: GenerateImagePayload): Promise<{ imageUrl: string }> {
    // Prompt forcé pour tests
    const prompt = "A happy dog";
    const numberImages = payload.numberImages || 1;

    const imageSize: OpenAIImageSize = '1024x1024';

    try {
      const response = await this.openai.images.generate({
        prompt,
        n: numberImages,
        size: imageSize,
        response_format: 'url',
      });

      if (!response.data || response.data.length === 0) {
        throw new InternalServerErrorException('Image generation failed: no image URLs returned.');
      }

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new InternalServerErrorException('Image generation failed: first image URL missing.');
      }

      this.logger.log(`Image generated with DALL·E successfully. URL: ${imageUrl}`);
      return { imageUrl };
    } catch (error: any) {
      this.logger.error(`DALL·E image generation error: ${error.message || error}`);
      throw new InternalServerErrorException(`Image generation with OpenAI DALL·E failed. Prompt: ${prompt}`);
    }
  }
}
