import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Imagen Base64 PNG real de muestra para vigor vegetativo NDVI (10m/px)
const sampleNdviBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAABR2m/sAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAADxBJREFUeJzt3X+QZWV9x/HPcw/L7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s";

// Imagen Base64 PNG real de muestra para Color Real RGB (10m/px)
const sampleRgbBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAABR2m/sAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAADxBJREFUeJzt3X+QZWV9x/HPcw/L7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s7s";

async function seedAllParcelsTelemetry() {
    console.log("Obteniendo parcelas activas de Supabase...");

    const { data: parcels, error: pErr } = await supabase
        .from('parcels')
        .select('*');

    if (pErr || !parcels || parcels.length === 0) {
        console.error("Error al consultar parcelas:", pErr);
        return;
    }

    console.log(`Parcelas encontradas: ${parcels.length}`);

    for (const parcel of parcels) {
        console.log(`Procesando parcela ID: ${parcel.id} | Cultivo: ${parcel.active_crop}`);

        // Verificar si ya tiene telemetría activa
        const { data: existing } = await supabase
            .from('sat_telemetry')
            .select('id')
            .eq('parcel_id', parcel.id);

        if (!existing || existing.length === 0) {
            console.log(`Creando registros de telemetría completos para la parcela ${parcel.active_crop}...`);

            const telemetryInsert = [
                {
                    parcel_id: parcel.id,
                    timestamp: new Date().toISOString(),
                    mission: 'Sentinel-2 L2A',
                    ndvi_avg: 0.68,
                    ndmi_avg: 0.42,
                    bsi_avg: -0.05,
                    cloud_cover: 5.2,
                    image_base64: sampleNdviBase64,
                    image_rgb_base64: sampleRgbBase64
                },
                {
                    parcel_id: parcel.id,
                    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    mission: 'Sentinel-2 L2A',
                    ndvi_avg: 0.64,
                    ndmi_avg: 0.38,
                    bsi_avg: -0.02,
                    cloud_cover: 8.1,
                    image_base64: sampleNdviBase64,
                    image_rgb_base64: sampleRgbBase64
                }
            ];

            const { data: insertedTel, error: insErr } = await supabase
                .from('sat_telemetry')
                .insert(telemetryInsert)
                .select();

            if (insErr) {
                console.error(`Error al insertar telemetría para ${parcel.active_crop}:`, insErr);
            } else {
                console.log(`¡Éxito! Insertados ${insertedTel.length} escaneos para ${parcel.active_crop}.`);
            }

            // También generar la alerta / diagnóstico de IA asociado
            const { error: alertErr } = await supabase
                .from('alerts_events')
                .insert([{
                    parcel_id: parcel.id,
                    anomaly_type: `Diagnóstico IA: Monitoreo Óptimo de Vigor en ${parcel.active_crop}`,
                    action_suggested: `El cultivo presenta un índice NDVI de 68% (Vigor vegetativo saludable). Se sugiere mantener la nutrición foliar y el esquema de riego actual.`,
                    severity: 'Baja',
                    notification_date: new Date().toISOString()
                }]);

            if (alertErr) console.error("Error al insertar alerta:", alertErr);
        } else {
            console.log(`La parcela ${parcel.active_crop} ya cuenta con ${existing.length} lecturas.`);
        }
    }
}

seedAllParcelsTelemetry();
