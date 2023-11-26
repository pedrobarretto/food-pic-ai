import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {
    this.openAIService = this.openAIService.getInstance();
  }

  @Post('/image')
  generateImage(
    @Body() body: { prompt: string },
  ): Promise<{ imageUrl: string }> {
    return this.openAIService.generateImage(body.prompt);
  }

  @Post('/mod-img')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'mask', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const filename = `${Date.now()}-${file.originalname}`;
            callback(null, filename);
          },
        }),
      },
    ),
  )
  modifyImage(
    @Body() body: { prompt: string },
    @UploadedFiles()
    files: { image: Express.Multer.File[]; mask: Express.Multer.File[] },
  ): Promise<any> {
    console.log(body);
    const { image, mask } = files;
    return this.openAIService.modifyImage(body.prompt, image[0], mask[0]);
  }
}
