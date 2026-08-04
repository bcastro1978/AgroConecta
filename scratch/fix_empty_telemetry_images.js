import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixEmptyTelemetryImages() {
    console.log("Revisando registros sin imágenes en sat_telemetry...");

    const { data: emptyRows, error } = await supabase
        .from('sat_telemetry')
        .select('id, parcel_id, timestamp, image_base64')
        .or('image_base64.eq.,image_base64.is.null');

    if (error) {
        console.error("Error al consultar:", error);
        return;
    }

    console.log(`Encontrados ${emptyRows ? emptyRows.length : 0} registros con imágenes vacías.`);

    if (emptyRows && emptyRows.length > 0) {
        const idsToDelete = emptyRows.map(r => r.id);
        const { error: delErr } = await supabase
            .from('sat_telemetry')
            .delete()
            .in('id', idsToDelete);

        if (delErr) {
            console.error("Error al eliminar registros incompletos:", delErr);
        } else {
            console.log("¡ÉXITO! Registros incompletos con imágenes vacías eliminados. Solo quedan firmas radiométricas completas.");
        }
    }
}

fixEmptyTelemetryImages();
