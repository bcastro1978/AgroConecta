import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const userId = '992a9104-5944-4115-afed-038e071c3997';
  const targetEmail = 'boris.castro.a@gmail.com';
  console.log(`Buscando referencias para el usuario ${userId} (${targetEmail})...`);

  // Lista de posibles tablas con referencias a usuarios
  const tables = ['users', 'properties', 'b2b_leads', 'quotes', 'b2b_listings', 'provider_branches'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').or(`id.eq.${userId},user_id.eq.${userId},producer_id.eq.${userId},provider_id.eq.${userId}`);
    if (error) {
      console.log(`Tabla ${table}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`Encontrados ${data.length} registros en ${table}:`, data);
    }
  }

  // Intentamos borrar de public.users primero
  console.log('Borrando de public.users...');
  const { error: delUserErr } = await supabase.from('users').delete().eq('id', userId);
  if (delUserErr) console.error('Error al borrar de public.users:', delUserErr);
  else console.log('Borrado de public.users exitoso.');

  // Ahora intentamos borrar de auth.users
  console.log('Borrando de auth.users...');
  const { error: delAuthErr } = await supabase.auth.admin.deleteUser(userId);
  if (delAuthErr) {
    console.error('Error al borrar de auth.users:', delAuthErr);
  } else {
    console.log('✅ Usuario borrado exitosamente de Supabase Auth!');
  }
}

main();
