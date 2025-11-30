import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from './datasource/typeorm.module';
import { SupabaseClientModule } from './supabase-client/supabase-client.module';
import { FileProcessingModuleModule } from './file-processing-module/file-processing-module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule,
    SupabaseClientModule,
    FileProcessingModuleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
