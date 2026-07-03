import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envContent.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
    let [k, ...v] = line.split('=');
    return [k.trim(), v.join('=').replace(/^"|"$/g, '').trim()];
  })
);

// Usamos SERVICE_ROLE_KEY para ver todo el resultado
const supabase = createClient(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY']);

async function getRecommendations() {
    const { data, error } = await supabase
        .from('crop_recommendations')
        .select(`
            *,
            parcels (
                active_crop
            )
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    console.log(JSON.stringify(data, null, 2));
}

getRecommendations();
