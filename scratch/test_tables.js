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

async function testTables() {
    console.log("Testing tables...");
    
    const tables = ['parcels', 'sat_telemetry', 'alerts_events', 'crop_recommendations', 'association_members'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.error(`❌ Table '${table}':`, error.message, `(Code: ${error.code})`);
            } else {
                console.log(`✅ Table '${table}': OK`);
            }
        } catch (e) {
            console.error(`💥 Table '${table}': Unexpected error`, e);
        }
    }
}

testTables();
