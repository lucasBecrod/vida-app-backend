import { Body, Controller, Get, Post } from '@nestjs/common';
import { FileProcessingModuleService } from './file-processing-module.service';
import path from 'path';

@Controller('webhook')
export class FileWebhookController {
  constructor(
    private readonly fileProcessingService: FileProcessingModuleService,
  ) {}

  @Get('file-uploaded')
  async handleFileUploaded(
    @Body() body: { path: string; fileType: string; fileName: string },
  ) {

    try {
      const data = await this.fileProcessingService.extractTextContent({
        filePath: body.path,
        fileType: body.fileType,
        filename: body.fileName,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }
}
