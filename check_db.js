import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hggasaxqcccsjayjqvaz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2FzYXhxY2Njc2pheWpxdmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODM4MTIsImV4cCI6MjA5OTY1OTgxMn0.Vjt_yQ21T-_niwbcvclqinraC8nbA5XBiQyvEFI53-8');

async function check() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Users:', data);
  if (error) console.error(error);
}

check();
