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
      .select('*');

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  }

  @Get('get-file-url/')
  async getFileUrl(@Body('fileName') fileName: string) {
    try {
      const { data } = await this.supabaseClient.storage
        .from('medical-files')
        .getPublicUrl(fileName);

      if (!data.publicUrl) {
        return { success: false, error: 'Failed to get storage URL' };
      }

      return { success: true, publicUrl: data.publicUrl };
    } catch (error) {
      console.error('Error getting file URL:', error);
      return { success: false, error };
    }
  }

  @Get('get-files/')
  async getFiles() {
    try {
      const { data } = await this.supabaseClient.storage
        .from('medical-files')
        .list('uploads');

      if (!data) {
        return { success: false, error: 'Failed to get storage URL' };
      }

      return { success: true, publicUrl: data };
    } catch (error) {
      console.error('Error getting file URL:', error);
      return { success: false, error };
    }
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
        storageId: data.id,
        filename: fileName,
        bytes: file.buffer.length,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error('Caught an error:', error);
      return { success: false, error };
    }
  }
}
