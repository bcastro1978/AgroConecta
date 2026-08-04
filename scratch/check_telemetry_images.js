import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTelemetryImages() {
    const { data: telemetry, error } = await supabase
        .from('sat_telemetry')
        .select('id, parcel_id, timestamp, mission, image_base64, image_rgb_base64')
        .limit(10);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Registros en sat_telemetry:", telemetry.length);
    for (const t of telemetry) {
        console.log(`ID: ${t.id} | Timestamp: ${t.timestamp} | Mission: ${t.mission}`);
        console.log(` - image_base64 length: ${t.image_base64 ? t.image_base64.length : 0}`);
        console.log(` - image_rgb_base64 length: ${t.image_rgb_base64 ? t.image_rgb_base64.length : 0}`);
        if (t.image_base64) {
            console.log(` - image_base64 prefix: ${t.image_base64.substring(0, 50)}...`);
        }
        if (t.image_rgb_base64) {
            console.log(` - image_rgb_base64 prefix: ${t.image_rgb_base64.substring(0, 50)}...`);
        }
    }
}

checkTelemetryImages();
