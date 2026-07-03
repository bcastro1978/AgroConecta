import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envContent.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
    let [k, ...v] = line.split('=');
    return [k.trim(), v.join('=').replace(/^"|"$/g, '').trim()];
  })
);

const supabase = createClient(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function verifyParcels() {
    const { data, error } = await supabase.from('parcels').select('id, active_crop');
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Listado Final de Parcelas en DB:");
        data.forEach((p, i) => console.log(`${i+1}. ${p.active_crop} [ID: ${p.id}]`));
    }
}

verifyParcels();
