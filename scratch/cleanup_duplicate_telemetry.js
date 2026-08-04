import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanupDuplicates() {
    console.log("Consultando registros de sat_telemetry en Supabase...");

    const { data: telemetry, error } = await supabase
        .from('sat_telemetry')
        .select('*')
        .order('timestamp', { ascending: false });

    if (error || !telemetry) {
        console.error("Error al obtener sat_telemetry:", error);
        return;
    }

    console.log(`Total registros en sat_telemetry: ${telemetry.length}`);

    const seenKeys = new Set();
    const duplicateIds = [];

    for (const t of telemetry) {
        const dateStr = new Date(t.timestamp).toISOString().split('T')[0];
        const key = `${t.parcel_id}_${dateStr}`;

        if (seenKeys.has(key)) {
            duplicateIds.push(t.id);
        } else {
            seenKeys.add(key);
        }
    }

    console.log(`Encontrados ${duplicateIds.length} registros duplicados en sat_telemetry.`);

    if (duplicateIds.length > 0) {
        const { error: delErr } = await supabase
            .from('sat_telemetry')
            .delete()
            .in('id', duplicateIds);

        if (delErr) {
            console.error("Error eliminando duplicados:", delErr);
        } else {
            console.log("¡Éxito! Registros duplicados de telemetría eliminados de Supabase.");
        }
    }
}

cleanupDuplicates();
