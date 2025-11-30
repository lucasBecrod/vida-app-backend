import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

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

    // Use filePath for download (it contains the full path in the bucket)
    const downloadPath = filePath || filename;

    const { data, error } = await this.supabase.storage
      .from('medical-files')
      .download(downloadPath);

    if (error || !data) {
      console.error('Supabase download error:', error);
      throw new Error(
        `Failed to download file from storage: ${error?.message || 'No data returned'}. Path: ${downloadPath}`,
      );
    }

    // 2. Convertir a Buffer
    const buffer = Buffer.from(await data.arrayBuffer());

    const mimeType = fileType.toLowerCase();

    // 🖼 Imagen
    if (SUPPORTED_IMAGE_TYPES.includes(mimeType as any)) {
      return this.extractImageText(buffer, mimeType);
    }

    // 📄 PDF
    if (mimeType.includes('pdf')) {
      return this.extractPdfText(buffer, mimeType, filename);
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
  async extractPdfText(fileBuffer: Buffer, mimeType: string, filename: string) {
    // Use pdf-parse to extract text from PDF
    const pdfParser = new PDFParse({ data: fileBuffer });
    const textResult = await pdfParser.getText();
    const extractedText = textResult.text;

    // Clean up resources
    await pdfParser.destroy();

    // If the text is empty or needs cleaning, use LLM to process it
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Could not extract text from PDF');
    }

    // Optionally use LLM to clean/format the extracted text
    const messages = await this.langchain.invoke([
      { role: 'system', content: SYSTEM_PROMPTS.pdf },
      {
        role: 'user',
        content:
          "Clean and format the following text extracted from a PDF. Return only the cleaned text without explaining what you're doing:\n\n" +
          extractedText,
      },
    ]);

    return typeof messages.content === 'string'
      ? messages.content
      : messages.content.toString();
  }

  // 🖼 Extracción desde imagen
  async extractImageText(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    // Convert buffer to base64 data URL
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await this.langchain.invoke([
      { role: 'system', content: SYSTEM_PROMPTS.image },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
            },
          },
          {
            type: 'text',
            text: 'Describe or transcribe the content of this image.',
          },
        ],
      },
    ]);

    return typeof response.content === 'string'
      ? response.content
      : response.content.toString();
  }
}
