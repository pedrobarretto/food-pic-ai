import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  private instance: OpenAIService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['OPEN_AI_KEY'],
    });
  }

  public getInstance() {
    if (!this.instance) {
      this.instance = new OpenAIService();
    }

    return this.instance;
  }

  public async generateImage(prompt: string) {
    const res = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    });

    const imageUrl = res.data[0].url;

    console.log(imageUrl);

    return { imageUrl };
  }

  public async modifyImage(
    prompt: string,
    image: Express.Multer.File,
    mask: Express.Multer.File,
  ) {
    try {
      console.log('modifyImage...');

      const filePath = path.join('uploads', image.filename);
      const maskPath = path.join('uploads', mask.filename);

      if (!fs.existsSync(filePath) || !fs.existsSync(maskPath)) {
        throw new Error(`File not found: ${filePath} or ${maskPath}`);
      }

      const res = await this.openai.images.edit({
        model: 'dall-e-2',
        prompt,
        image: fs.createReadStream(filePath),
        mask: fs.createReadStream(maskPath),
        n: 1,
        size: '512x512',
      });

      const imageUrl = res.data[0].url;

      return { imageUrl };
    } catch (error) {
      console.error('Error modifying image:', error.message);
      return { error: error.message, status: 404 };
    }
  }
}
