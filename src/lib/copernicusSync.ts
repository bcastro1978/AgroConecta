import { supabase } from './supabase';

function getBBoxFromGeometry(geometry: any) {
    let coords = geometry.type === "Polygon" ? geometry.coordinates[0] : geometry.coordinates[0][0]; 
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coords.forEach((c: any) => {
        if (c[0] < minLng) minLng = c[0];
        if (c[0] > maxLng) maxLng = c[0];
        if (c[1] < minLat) minLat = c[1];
        if (c[1] > maxLat) maxLat = c[1];
    });
    const padding = 0.0005;
    return [[minLat - padding, minLng - padding], [maxLat + padding, maxLng + padding]];
}

const statsEvalScript = `//VERSION=3
function setup() {
  return { input: ["B02", "B04", "B08", "B11", "dataMask"], output: [ { id: "ndvi", bands: 1 }, { id: "ndmi", bands: 1 }, { id: "bsi", bands: 1 }, { id: "dataMask", bands: 1 } ] };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let ndmi = (sample.B08 - sample.B11) / (sample.B08 + sample.B11);
  let bsi = ((sample.B11 + sample.B04) - (sample.B08 + sample.B02)) / ((sample.B11 + sample.B04) + (sample.B08 + sample.B02));
  return { ndvi: [ndvi], ndmi: [ndmi], bsi: [bsi], dataMask: [sample.dataMask] };
}`;

const processEvalScript = `//VERSION=3
function setup() { return { input: ["B04", "B08", "B03", "dataMask"], output: { bands: 4 } }; }
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (sample.dataMask === 0) return [0, 0, 0, 0];
  if (ndvi < 0) return [0.5, 0.5, 0.5, 0.8]; 
  if (ndvi < 0.2) return [0.8, 0.8, 0.8, 0.8]; 
  if (ndvi < 0.4) return [0.8, 0.6, 0.2, 0.8]; 
  if (ndvi < 0.6) return [0.2, 0.8, 0.2, 0.8]; 
  return [0, 0.5, 0, 0.8]; 
}`;

const rgbEvalScript = `//VERSION=3
function setup() { return { input: ["B04", "B03", "B02", "dataMask"], output: { bands: 3 } }; }
function evaluatePixel(sample) {
  if (sample.dataMask === 0) return [0, 0, 0];
  return [ Math.min(2.5 * sample.B04, 1.0), Math.min(2.5 * sample.B03, 1.0), Math.min(2.5 * sample.B02, 1.0) ];
}`;

export const syncSingleParcel = async (parcelId: string) => {
    try {
        console.log(`[Copernicus Sync] Iniciando sincronización para parcela: ${parcelId}`);

        // 1. Obtener datos de la parcela
        const { data: parcel, error: parcelErr } = await supabase.from('parcels').select('*').eq('id', parcelId).single();
        if (parcelErr || !parcel) throw new Error("No se encontró la parcela");

        // 2. Obtener Token de Sentinel Hub
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        console.log("CLIENT ID FROM ENV:", import.meta.env.VITE_SENTINEL_CLIENT_ID ? "LOADED" : "UNDEFINED");
        params.append('client_id', import.meta.env.VITE_SENTINEL_CLIENT_ID);
        params.append('client_secret', import.meta.env.VITE_SENTINEL_CLIENT_SECRET);

        const tokenRes = await fetch('/api/cdse-auth/auth/realms/CDSE/protocol/openid-connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        
        if (!tokenRes.ok) throw new Error(`Fallo OAuth CDSE: ${tokenRes.statusText}`);
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const geometry = parcel.geometry;
        const bbox = getBBoxFromGeometry(geometry);
        const toDate = new Date().toISOString();
        const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 dias

        const inputData = { 
            type: "sentinel-2-l2a", 
            dataFilter: { timeRange: { from: fromDate, to: toDate }, maxCloudCoverage: 80 },
            processing: { upsampling: "BICUBIC" } 
        };

        // 3. Obtener estadísticas (NDVI, NDMI, BSI)
        const resStats = await fetch('/api/cdse-sh/api/v1/statistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                input: { bounds: { geometry: geometry }, data: [inputData] },
                aggregation: { timeRange: { from: fromDate, to: toDate }, aggregationInterval: { of: "P30D" }, evalscript: statsEvalScript, resx: 10, resy: 10 }
            })
        });

        if (!resStats.ok) throw new Error(`Fallo consulta satélite: ${resStats.status}`);
        const statData = await resStats.json();
        
        if (!statData.data || statData.data.length === 0 || !statData.data[0].outputs) {
            throw new Error("No hay datos satelitales (demasiadas nubes)");
        }
        
        const ndviMean = statData.data[0].outputs.ndvi.bands.B0.stats.mean;
        const ndmiMean = statData.data[0].outputs.ndmi.bands.B0.stats.mean;
        const bsiMean  = statData.data[0].outputs.bsi.bands.B0.stats.mean;

        const payloadProcess = {
            input: { bounds: { geometry: geometry }, data: [inputData] },
            output: { width: 512, height: 512, responses: [{ identifier: "default", format: { type: "image/png" } }] }
        };

        // Función auxiliar para convertir buffer a base64 en el navegador
        const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        };

        let rasterBase64 = null;
        let rgbBase64 = null;

        try {
            const resImg = await fetch('/api/cdse-sh/api/v1/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'image/png' },
                body: JSON.stringify({ ...payloadProcess, evalscript: processEvalScript })
            });
            if (resImg.ok) {
                const arrayBuf = await resImg.arrayBuffer();
                rasterBase64 = `data:image/png;base64,${arrayBufferToBase64(arrayBuf)}`;
            }

            const resRgb = await fetch('/api/cdse-sh/api/v1/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'image/png' },
                body: JSON.stringify({ ...payloadProcess, evalscript: rgbEvalScript })
            });
            if (resRgb.ok) {
                const arrayBufRgb = await resRgb.arrayBuffer();
                rgbBase64 = `data:image/png;base64,${arrayBufferToBase64(arrayBufRgb)}`;
            }
        } catch(e: any) {
            console.log("Error al obtener imágenes en navegador:", e.message);
        }

        const telemetryResult = { 
            mission: 'Sentinel-2 L2A',
            ndvi: ndviMean, 
            ndmi: ndmiMean, 
            bsi: bsiMean, 
            raster: rasterBase64, 
            rgb: rgbBase64, 
            bbox: bbox 
        };

        // 4. Guardar en Base de Datos
        const { error: telErr } = await supabase.from('sat_telemetry').insert({
            parcel_id: parcel.id,
            timestamp: new Date().toISOString(),
            mission: telemetryResult.mission,
            ndvi_avg: telemetryResult.ndvi,
            ndmi_avg: telemetryResult.ndmi,
            bsi_avg: telemetryResult.bsi,
            cloud_cover: 0,
            image_base64: telemetryResult.raster,
            image_rgb_base64: telemetryResult.rgb,
            image_bounds: telemetryResult.bbox
        });

        if (telErr) throw new Error("Error guardando telemetría en BD: " + telErr.message);

        // 5. Alertas de agua (MVP) y Análisis del Ingeniero Agrícola IA
        try {
            const { consultAgriculturalExpert } = await import('./agriExpertAI');
            const aiDiagnosis = await consultAgriculturalExpert(parcel, telemetryResult);
            
            if (aiDiagnosis) {
                await supabase.from('alerts_events').insert({
                    parcel_id: parcel.id,
                    severity: aiDiagnosis.severity,
                    anomaly_type: `Diagnóstico IA: ${aiDiagnosis.title}`,
                    action_suggested: aiDiagnosis.diagnosis
                });
            } else {
                // Fallback si la IA falla
                if (telemetryResult.ndmi < -0.1) {
                    await supabase.from('alerts_events').insert({
                        parcel_id: parcel.id,
                        severity: 'Alta',
                        anomaly_type: 'WATER_STRESS (Estrés Hídrico Severo)',
                        action_suggested: 'Activar sistemas de riego parcelario tecnificado o micro reservorios de inmediato para prevenir pérdidas por sequía.'
                    });
                }
            }
        } catch(aiError) {
            console.error("Error al procesar el análisis de IA:", aiError);
        }

        console.log(`[Copernicus Sync] Completado exitosamente para parcela: ${parcelId}`);
        return true;
    } catch (error: any) {
        console.error("Error en syncSingleParcel:", error);
        return false;
    }
};
