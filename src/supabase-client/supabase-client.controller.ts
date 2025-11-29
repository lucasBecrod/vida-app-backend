import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectSupabase, SupabaseCli } from './supabase.provider';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Controller('supabase-client')
export class SupabaseClientController {
  // You can inject the Supabase client here using the InjectSupabase decorator
  constructor(@InjectSupabase() private readonly supabaseClient: SupabaseCli) {}

  @Get('test-connection')
  async testConnection() {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: UploadedFile) {
    try {
      console.log('Received file:', file);

      // Nombre del archivo (puedes modificarlo para hacerlo único)
      const fileName = `${Date.now()}-${file.originalname}`;

      const { data, error } = await this.supabaseClient.storage
        .from('medical-files') // Tu bucket
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // Cambia a true si deseas reemplazar archivos con el mismo nombre
        });

      if (error) {
        console.error('Error uploading:', error);
        return { success: false, error };
      }

      return {
        success: true,
        data,
        publicUrl: this.supabaseClient.storage
          .from('medical-files')
          .getPublicUrl(fileName).data.publicUrl,
      };
    } catch (error) {
      console.error('Caught an error:', error);
      return { success: false, error };
    }
  }
}
