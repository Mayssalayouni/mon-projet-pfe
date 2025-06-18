import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OpenAIService {
    private readonly apiKey = process.env.OPENAI_API_KEY;

    // Nettoie et simplifie le prompt pour éviter le rejet par OpenAI
    private sanitizePrompt(prompt: string): string {
        return prompt
            .replace(/[^a-zA-Z0-9.,!?'"()\s]/g, '') // Supprime caractères spéciaux
            .trim()
            .slice(0, 500); // Limite à 500 caractères
    }

    async generateImage(prompt: string, folderName: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    model: 'dall-e-3',
                    prompt: prompt,
                    n: 1,
                    size: '1024x1024',
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const imageUrl = response.data.data[0].url;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            const fileName = `image_${Date.now()}.png`;
            const localFolder = path.join(__dirname, '../../../uploads', folderName);
            fs.mkdirSync(localFolder, { recursive: true });
            const localPath = path.join(localFolder, fileName);
            fs.writeFileSync(localPath, imageResponse.data);

            const publicPath = `/images/${folderName}/${fileName}`;
            return publicPath;
        } catch (error) {
            console.error('[OpenAIService] Error generating image:', error.response?.data || error.message);
            throw new Error('Failed to generate image: ' + (error.response?.data?.error?.message || error.message));
        }
    }


}
