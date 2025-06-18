// src/translate/translate.controller.ts
import { Body, Controller, Post, Logger } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  private readonly logger = new Logger(TranslateController.name);

  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async traduire(@Body() body: { text: string; source?: string; target?: string }) {
    const { text, source = 'fr', target = 'ar' } = body;
    this.logger.log(`Reçu: ${text} | source: ${source}, target: ${target}`);
    const traduction = await this.translateService.traduireTexte(text, source, target);
    return { translatedText: traduction };
  }
}
