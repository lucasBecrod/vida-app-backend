import { Global, Module } from '@nestjs/common';
import { SUPABASE_CLIENT } from './supabase.provider';
import { ConfigService } from '@nestjs/config';
import { SupabaseClientController } from './supabase-client.controller';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (config: ConfigService) => {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = config.get('SUPABASE_URL');
        const supabaseServiceRoleKey = config.get('SUPABASE_SERVICE_ROLE_KEY');
        return createClient(supabaseUrl, supabaseServiceRoleKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
  controllers: [SupabaseClientController],
})
export class SupabaseClientModule {}
