import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectSupabase, SupabaseCli } from './supabase.provider';

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

  @Post('insert-file')
  async insertProfile(
    @Body() profileData: { fileName: string; image: File | Buffer },
  ) {
    try {
      const { fileName, image } = profileData;

      const { data: imageData, error: uploadError } =
        await this.supabaseClient.storage
          .from('demo-storage')
          .upload(fileName, image);

      if (uploadError) {
        console.log('SupabaseError uploading: ', uploadError);
        return { success: false, error: uploadError };
      }

      if (imageData) {
        console.log(imageData);
        return { success: true, data: imageData };
      }
    } catch (error) {
      console.log('Caught an error: ', error);
      return { success: false, error };
    }
  }
}
