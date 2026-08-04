import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixPapaMapping() {
    console.log("Buscando productos de Papa en products_catalog...");
    
    const { data: products, error: prodErr } = await supabase
        .from('products_catalog')
        .select('*');

    if (prodErr || !products) {
        console.error("Error leyendo catálogo:", prodErr);
        return;
    }

    const papaProducts = products.filter(p => p.name.toLowerCase().includes('papa'));
    console.log("Productos de papa en catálogo:", papaProducts.map(p => ({ id: p.id, name: p.name, category: p.category })));

    // Encontrar el producto de Papa de consumo / tubérculo
    const realPapaHarvest = papaProducts.find(p => 
        !p.name.toLowerCase().includes('semilla') && 
        (p.category || '').toLowerCase().includes('tubérculo')
    ) || papaProducts.find(p => !p.name.toLowerCase().includes('semilla'));

    if (!realPapaHarvest) {
        console.error("No se encontró producto de Papa (Consumo / Tubérculo).");
        return;
    }

    console.log("Producto de consumo seleccionado para reemplazar:", realPapaHarvest);

    // Actualizar todos los registros de market_prices donde el product_id sea una semilla de papa
    const semillaIds = papaProducts.filter(p => p.name.toLowerCase().includes('semilla')).map(p => p.id);

    const { data: updated, error: updateErr } = await supabase
        .from('market_prices')
        .update({ product_id: realPapaHarvest.id })
        .in('product_id', semillaIds)
        .select();

    if (updateErr) {
        console.error("Error al actualizar registros en market_prices:", updateErr);
    } else {
        console.log("¡Éxito! Registros corregidos en Supabase:", updated.length);
    }
}

fixPapaMapping();
