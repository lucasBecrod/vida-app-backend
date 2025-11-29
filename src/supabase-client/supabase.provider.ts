import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

// Custom provider
export const InjectSupabase = () => Inject(SUPABASE_CLIENT);
// Supabase types
export type SupabaseCli = SupabaseClient;
