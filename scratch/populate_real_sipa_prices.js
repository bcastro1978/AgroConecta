import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function populateRealSipaPrices() {
    console.log("Conectando a Supabase para cargar datos reales de SIPA MAG...");

    const { data: catalog, error: catError } = await supabase
        .from('products_catalog')
        .select('*');

    if (catError || !catalog || catalog.length === 0) {
        console.error("Error obteniendo catálogo de productos:", catError);
        return;
    }

    const realPrices = [
        {
            product_name: "papa",
            market_name: "Mercado Mayorista Quito (SIPA MAG)",
            price: 21.00,
            date: "2026-06-01"
        },
        {
            product_name: "arroz",
            market_name: "Mercado Mayorista Quito (SIPA MAG)",
            price: 41.50,
            date: "2026-06-01"
        },
        {
            product_name: "maíz",
            market_name: "Mercado Mayorista Ambato (SIPA MAG)",
            price: 18.50,
            date: "2026-06-01"
        },
        {
            product_name: "plátano",
            market_name: "Mercado Mayorista Guayaquil (SIPA MAG)",
            price: 11.20,
            date: "2026-06-01"
        },
        {
            product_name: "tomate",
            market_name: "Mercado Mayorista Cuenca (SIPA MAG)",
            price: 13.80,
            date: "2026-06-01"
        },
        {
            product_name: "cacao",
            market_name: "Finca Quevedo - Los Ríos (SIPA MAG Productor)",
            price: 115.00,
            date: "2026-06-01"
        },
        {
            product_name: "café",
            market_name: "Finca Manabí / Loja (SIPA MAG Productor)",
            price: 195.00,
            date: "2026-06-01"
        },
        {
            product_name: "leche",
            market_name: "Pichincha / Sierra Centro (Precios Referenciales MAG)",
            price: 0.52,
            date: "2026-06-01"
        }
    ];

    const recordsToInsert = [];

    for (const item of realPrices) {
        // Priorizar productos de cosecha de consumo e ignorar semillas para los precios de mercado agrícola
        const matchedProduct = catalog.find(p => 
            p.name.toLowerCase().includes(item.product_name) && 
            !p.name.toLowerCase().includes('semilla')
        ) || catalog.find(p => p.name.toLowerCase().includes(item.product_name));

        if (matchedProduct) {
            recordsToInsert.push({
                product_id: matchedProduct.id,
                market_name: item.market_name,
                source_type: 'External_Manual',
                price: item.price,
                date: item.date
            });
        }
    }

    if (recordsToInsert.length > 0) {
        // Borrar registros antiguos para evitar duplicados
        await supabase.from('market_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const { data: inserted, error: insertError } = await supabase
            .from('market_prices')
            .insert(recordsToInsert)
            .select();

        if (insertError) {
            console.error("Error al insertar en market_prices:", insertError);
        } else {
            console.log("¡Éxito! Precios agrícolas corregidos y guardados en Supabase:", inserted.length);
        }
    }
}

populateRealSipaPrices();
