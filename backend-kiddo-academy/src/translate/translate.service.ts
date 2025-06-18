import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import type translateModule from 'translate'; // Use 'type' import for type safety without runtime import

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private translate: typeof translateModule | null = null; // Initialize as null

  private async initTranslate() {
    if (!this.translate) { // Only try to initialize if it's null
      try {
        const dynamicImport = new Function('moduleName', 'return import(moduleName)');
        const module = await dynamicImport('translate');

        if (typeof module.default === 'function') {
          this.translate = module.default;
          // Null check here before accessing properties
          if (this.translate) { // Add this null check
            this.translate.engine = 'google';
            this.translate.key = undefined; // Ensure this is undefined or your actual API key
          }
        } else {
          throw new Error('The "translate" module default export is not a function.');
        }

      } catch (error) {
        this.logger.error('Failed to load or initialize "translate" module:', error);
        this.logger.error(error); // Log the full error object for more details
        throw new InternalServerErrorException('Failed to initialize translation service. Please check server logs.');
      }
    }
  }

  async traduireTexte(text: string, source = 'fr', target = 'ar'): Promise<string> {
    try {
      await this.initTranslate();

      // Crucial null check before using this.translate
      if (this.translate === null || typeof this.translate !== 'function') {
        throw new InternalServerErrorException('Translation service is not initialized or configured correctly.');
      }

      // Now TypeScript knows this.translate is not null and is a function
      const traduction = await this.translate(text, { from: source, to: target });
      this.logger.log(`Texte traduit: "${text}" => "${traduction}"`);
      return traduction;
    } catch (error) {
      this.logger.error('Erreur lors de la traduction du texte:', error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la traduction du texte.');
    }
  }
}