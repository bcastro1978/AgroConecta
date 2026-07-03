import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envContent.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
    let [k, ...v] = line.split('=');
    return [k.trim(), v.join('=').replace(/^"|"$/g, '').trim()];
  })
);

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function checkData() {
    // Intentar leer como anónimo o con el token de boris si lo tuviéramos, 
    // pero aquí usaremos la anon key para ver si las políticas SELECT funcionan.
    const { data: recs, error: err } = await supabase.from('crop_recommendations').select('*').limit(5);
    if (err) console.error("Error fetching:", err);
    else console.log("Recommendations found:", recs.length);
    
    const { data: tel, error: err2 } = await supabase.from('sat_telemetry').select('*').limit(5);
    if (err2) console.error("Error fetching telemetry:", err2);
    else console.log("Telemetry records found:", tel.length);
}

checkData();
