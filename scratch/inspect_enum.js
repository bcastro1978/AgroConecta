import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const unitsToTest = ['Quintal', 'Saco', 'Caja', 'Litro', 'Kilo', 'Unidad', 'Tonelada', 'Ciento', 'Atado'];
  for (const u of unitsToTest) {
    const { data, error } = await supabase.from('products_catalog').insert({
      name: `Test Product ${u}`,
      category: 'Prueba',
      unit: u
    }).select();
    if (error) {
      console.log(`Unit "${u}" ERROR:`, error.message);
    } else {
      console.log(`Unit "${u}" SUCCESS!`);
      if (data && data[0]) {
        await supabase.from('products_catalog').delete().eq('id', data[0].id);
      }
    }
  }
}

main();
