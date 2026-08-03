import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hggasaxqcccsjayjqvaz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2FzYXhxY2Njc2pheWpxdmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODM4MTIsImV4cCI6MjA5OTY1OTgxMn0.Vjt_yQ21T-_niwbcvclqinraC8nbA5XBiQyvEFI53-8');

async function updateKepsek() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'kepsek');
  if (error) {
    console.error(error);
    return;
  }
  
  if (data && data.length > 0) {
    for (const user of data) {
      if (user.nip) {
        console.log(`Updating kepsek ${user.name} username to ${user.nip}`);
        await supabase.from('users').update({ username: user.nip }).eq('id', user.id);
      } else {
        console.log(`No NIP for kepsek ${user.name}, cannot update username`);
      }
    }
  } else {
    console.log("No kepsek found in database.");
  }
}

updateKepsek();
