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

async function createTestParcel() {
    const userId = '6bcf1fdb-dc1a-4415-a8e9-0886ce400cf6';
    console.log("🌱 Re-intentando creación de parcela para ID:", userId);
    
    const geometry = {
        type: "Polygon",
        coordinates: [[
            [-78.5028, -1.3985],
            [-78.5015, -1.3985],
            [-78.5015, -1.3998],
            [-78.5028, -1.3998],
            [-78.5028, -1.3985]
        ]]
    };

    // Insertar SOLO campos básicos garantizados
    const { data, error } = await supabase.from('parcels').insert({
        producer_id: userId,
        active_crop: 'Papa Superchola (Test IA)',
        geometry: geometry
    }).select();

    if (error) {
        console.error("❌ Error creando parcela:", error.message);
    } else {
        console.log("✅ Parcela creada exitosamente ID:", data[0].id);
    }
}

createTestParcel();
