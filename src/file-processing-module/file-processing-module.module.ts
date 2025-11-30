import { Module } from '@nestjs/common';
import { FileProcessingModuleService } from './file-processing-module.service';
import { FileWebhookController } from './file-webhook.controller';
import { ConfigService } from '@nestjs/config';
import { LANGCHAIN_CLIENT } from './langchain.provider';
import { SUPABASE_CLIENT } from 'src/supabase-client/supabase.provider';
import { SupabaseClientModule } from 'src/supabase-client/supabase-client.module';

@Module({
  providers: [
    FileProcessingModuleService,
    {
      provide: LANGCHAIN_CLIENT,
      useFactory: (config: ConfigService) => {
        const { ChatOpenAI } = require('@langchain/openai');
        return new ChatOpenAI({
          openAIApiKey: config.get<string>('OPENAI_API_KEY'),
          modelName: 'gpt-4o',
          temperature: 0.2,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [LANGCHAIN_CLIENT],
  controllers: [FileWebhookController],
})
export class FileProcessingModule {}
