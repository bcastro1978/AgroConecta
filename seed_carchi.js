import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedCarchi() {
    console.log("Iniciando inyección de datos para Don Carlos (Carchi)...");

    // 1. Crear Perfil Don Carlos
    const producerId = "00000000-0000-4000-8000-carchiprod001";
    
    // Check if user exists
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', producerId).single();
    
    if (!existingUser) {
        const { error: profileErr } = await supabase.from('users').insert({
            id: producerId,
            full_name: "Don Carlos",
            role: "producer",
            document_id: "0400000001",
            phone: "0999999999",
            location_ref_lat: 0.5015,
            location_ref_lng: -77.9015
        });
        if (profileErr) console.log("Error creando perfil:", profileErr.message);
        else console.log("Perfil Don Carlos creado exitosamente.");
    } else {
        console.log("El perfil de Don Carlos ya existe.");
    }

    // 2. Crear 5 parcelas de Café en Bolívar, Carchi
    const baseLat = 0.5000;
    const baseLng = -77.9000;
    const parcelas = [];

    for (let i = 1; i <= 5; i++) {
        // Offset simple para separar parcelas
        const latOffset = i * 0.002;
        const lngOffset = i * 0.002;
        
        const geom = {
            type: "Polygon",
            coordinates: [[
                [baseLng + lngOffset, baseLat + latOffset],
                [baseLng + lngOffset + 0.002, baseLat + latOffset],
                [baseLng + lngOffset + 0.002, baseLat + latOffset + 0.002],
                [baseLng + lngOffset, baseLat + latOffset + 0.002],
                [baseLng + lngOffset, baseLat + latOffset]
            ]]
        };

        parcelas.push({
            producer_id: producerId,
            name: `Finca Bolívar - Lote ${i}`,
            active_crop: 'Café',
            total_area: 2.5 + (i * 0.1), // ~2-3 hectáreas
            geometry: geom
        });
    }

    console.log("Insertando 5 parcelas...");
    const { error: parcelErr } = await supabase.from('parcels').insert(parcelas);
    
    if (parcelErr) {
        console.log("Error insertando parcelas:", parcelErr.message);
    } else {
        console.log("5 Parcelas creadas exitosamente en Bolívar, Carchi.");
    }
}

seedCarchi();
