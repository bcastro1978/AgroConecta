import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data, error } = await supabase.from('products_catalog').insert({
    name: 'Test Product 2',
    category: 'Fertilizantes y Nutrición',
    type: 'Fertilizante Edáfico',
    unit: 'Quintal'
  }).select();

  console.log('Insert type test result:', data, error);
  if (data && data.length > 0) {
    await supabase.from('products_catalog').delete().eq('id', data[0].id);
  }
}

main();
