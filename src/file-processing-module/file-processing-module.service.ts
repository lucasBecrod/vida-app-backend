import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { extractTextContent } from 'src/lib/files';

@Injectable()
export class FileProcessingModuleService {
  constructor(private readonly supabase: SupabaseClient) {}

  async processUploadedFile(file: {
    path: string;
    fileType: string;
    fileName: string;
  }) {
    const { path, fileType, fileName } = file;

    // 🔥 Llamas a tu función con el contexto correcto
    const textContent = await extractTextContent(
      { storage: this.supabase.storage },
      {
        filePath: path,
        filename: fileName,
        fileType,
      },
    );

    // 📌 Aquí puedes guardar el resultado en DB
    console.log('Contenido extraído:', textContent);

    return textContent;
  }
}
