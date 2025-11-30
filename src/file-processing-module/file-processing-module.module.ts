import { Module } from '@nestjs/common';
import { FileProcessingModuleService } from './file-processing-module.service';
import { FileWebhookController } from './file-webhook.controller';

@Module({
  providers: [FileProcessingModuleService],
  controllers: [FileWebhookController],
})
export class FileProcessingModuleModule {}
