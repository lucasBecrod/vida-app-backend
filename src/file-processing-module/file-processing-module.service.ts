import { Injectable } from '@nestjs/common';
import {
  InjectSupabase,
  SupabaseCli,
} from '../supabase-client/supabase.provider';
import { InjectLangchain } from './langchain.provider';

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const SYSTEM_PROMPTS = {
  image:
    'You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.',
  pdf: 'You transform PDF files into text.',
  html: 'You transform content into markdown.',
};

export type ExtractTextContentArgs = {
  filePath: string;
  filename: string;
  fileType: string;
};

@Injectable()
export class FileProcessingModuleService {
  constructor(
    @InjectSupabase() private readonly supabase: SupabaseCli,
    @InjectLangchain() private readonly langchain: any,
  ) {}

  // 👇 Función principal
  async extractTextContent(args: ExtractTextContentArgs): Promise<string> {
    const { fileType, filename, filePath } = args;

    // BUCKET NAME
    const { data } = await this.supabase.storage
      .from('medical-files')
      .getPublicUrl(filename);

    const mimeType = fileType.toLowerCase();

    // TODO: OK
    const url = data.publicUrl;

    /*   // 🖼 Imagen
    if (SUPPORTED_IMAGE_TYPES.includes(mimeType as any)) {
      return extractImageText(url);
    } */

    // 📄 PDF
    if (mimeType.includes('pdf')) {
      return this.extractPdfText(url, mimeType, filename);
    }

    // 📃 Texto
    if (mimeType.includes('text')) {
      return this.extractTextFileContent(filePath, mimeType);
    }

    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }

  // 📃 Extracción de archivos de texto
  async extractTextFileContent(
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    const { data } = await this.supabase.storage
      .from('medical-files')
      .download(filePath);

    if (!data) {
      throw new Error('Failed to get file content');
    }

    const text = await data.text();

    // Si es otro formato de texto, convertir a markdown con IA
    if (mimeType !== 'text/plain') {
      const response = await this.langchain.invoke([
        { role: 'system', content: SYSTEM_PROMPTS.html },
        {
          role: 'user',
          content:
            "Extract the text and convert it to markdown without explaining you'll do so.\n\n" +
            text,
        },
      ]);

      return typeof response.content === 'string'
        ? response.content
        : response.content.toString();
    }

    return text;
  }

  // 📄 Extracción de PDF
  async extractPdfText(
    url: string,
    mimeType: string,
    filename: string,
  ): Promise<string> {
    const response = await this.langchain.invoke([
      { role: 'system', content: SYSTEM_PROMPTS.pdf },
      {
        role: 'user',
        content: `Extract the text from this PDF without explaining you'll do so.\n\nFile: ${filename}\nURL: ${url}`,
      },
    ]);

    return typeof response.content === 'string'
      ? response.content
      : response.content.toString();
  }

  /* // 🖼 Extracción desde imagen
  async function extractImageText(url: string): Promise<string> {
    const response = await AI_MODEL.call([
      { role: 'system', content: SYSTEM_PROMPTS.image },
      {
        role: 'user',
        content: `Describe or transcribe the content of this image: ${url}`,
      },
    ]);
  
    return response.content;
  } */
}
