import { Body, Controller, Post } from '@nestjs/common';
import { FileProcessingModuleService } from './file-processing-module.service';

@Controller('webhook')
export class FileWebhookController {
  constructor(
    private readonly fileProcessingService: FileProcessingModuleService,
  ) {}

  @Post('file-uploaded')
  async handleFileUploaded(
    @Body() body: { path: string; fileType: string; fileName: string },
  ) {
    // 🚨 Importante: Validar secreto del webhook
    // if (body.secret !== process.env.WEBHOOK_SECRET) throw new UnauthorizedException();

    await this.fileProcessingService.processUploadedFile(body);
    return { status: 'ok' };
  }
}
