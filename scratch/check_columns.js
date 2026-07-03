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

async function getColumns() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'sat_telemetry' });
    if (error) {
        // Fallback: try to select one row and see the keys
        const { data: sample, error: err2 } = await supabase.from('sat_telemetry').select('*').limit(1);
        if (err2) console.error("Error:", err2);
        else console.log("Columns found:", Object.keys(sample[0]));
    } else {
        console.log("Columns via RPC:", data);
    }
}

getColumns();
