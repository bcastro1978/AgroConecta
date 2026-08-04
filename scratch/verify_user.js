import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Actualizando estado de verificación a Verified...');
  
  const { data, error } = await supabase
    .from('users')
    .update({ verification_status: 'Verified' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  if (error) {
    console.error('Error al actualizar usuarios:', error);
  } else {
    console.log('Usuarios actualizados a Verified:', data);
  }
}

main();
