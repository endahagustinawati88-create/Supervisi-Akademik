/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hggasaxqcccsjayjqvaz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2FzYXhxY2Njc2pheWpxdmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODM4MTIsImV4cCI6MjA5OTY1OTgxMn0.Vjt_yQ21T-_niwbcvclqinraC8nbA5XBiQyvEFI53-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
