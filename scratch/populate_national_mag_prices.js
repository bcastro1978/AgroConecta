import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function populateNationalMagPrices() {
    console.log("Conectando a Supabase para registrar Precios a Productor MAG Nivel Nacional...");

    // 1. Obtener catálogo
    const { data: catalog, error: catError } = await supabase
        .from('products_catalog')
        .select('*');

    if (catError || !catalog || catalog.length === 0) {
        console.error("Error obteniendo catálogo de productos:", catError);
        return;
    }

    console.log(`Catálogo cargado: ${catalog.length} productos.`);

    // 2. Precios a Productor (Pie de Finca) desagregados por Provincias extraídos del Tablero MAG (bi.mag.gob.ec/views/P_P/TBL_PP)
    const nationalProducerPrices = [
        // CACAO
        { product_search: "cacao", market_name: "Finca Quevedo / Mocache (MAG Los Ríos)", price: 118.00, date: "2026-06-01" },
        { product_search: "cacao", market_name: "Finca Milagro / Naranjal (MAG Guayas)", price: 115.00, date: "2026-06-01" },
        { product_search: "cacao", market_name: "Finca Chone / Quinindé (MAG Manabí)", price: 112.50, date: "2026-06-01" },
        { product_search: "cacao", market_name: "Finca Santo Domingo (MAG Santo Domingo)", price: 116.00, date: "2026-06-01" },
        { product_search: "cacao", market_name: "Finca Machala / Santa Rosa (MAG El Oro)", price: 114.00, date: "2026-06-01" },

        // ARROZ
        { product_search: "arroz", market_name: "Finca Daule / Salitre (MAG Guayas)", price: 35.50, date: "2026-06-01" },
        { product_search: "arroz", market_name: "Finca Babahoyo / Ventanas (MAG Los Ríos)", price: 34.80, date: "2026-06-01" },
        { product_search: "arroz", market_name: "Finca Portoviejo / Rocafuerte (MAG Manabí)", price: 34.00, date: "2026-06-01" },
        { product_search: "arroz", market_name: "Finca Arenillas (MAG El Oro)", price: 35.00, date: "2026-06-01" },

        // PAPA
        { product_search: "papa", market_name: "Finca Tulcán / San Gabriel (MAG Carchi)", price: 16.50, date: "2026-06-01" },
        { product_search: "papa", market_name: "Finca Machachi / Mejia (MAG Pichincha)", price: 17.50, date: "2026-06-01" },
        { product_search: "papa", market_name: "Finca Quero / Pillaro (MAG Tungurahua)", price: 17.00, date: "2026-06-01" },
        { product_search: "papa", market_name: "Finca Guaranda (MAG Bolívar)", price: 16.00, date: "2026-06-01" },

        // MAIZ
        { product_search: "maíz", market_name: "Finca Ventanas / Puebloviejo (MAG Los Ríos)", price: 16.20, date: "2026-06-01" },
        { product_search: "maíz", market_name: "Finca Balzar / El Empalme (MAG Guayas)", price: 16.00, date: "2026-06-01" },
        { product_search: "maíz", market_name: "Finca Pindal / Celica (MAG Loja)", price: 15.80, date: "2026-06-01" },
        { product_search: "maíz", market_name: "Finca Tosagua (MAG Manabí)", price: 15.90, date: "2026-06-01" },

        // PLATANO
        { product_search: "plátano", market_name: "Finca El Carmen (MAG Manabí)", price: 7.50, date: "2026-06-01" },
        { product_search: "plátano", market_name: "Finca La Concordia (MAG Santo Domingo)", price: 7.80, date: "2026-06-01" },
        { product_search: "plátano", market_name: "Finca Buena Fe (MAG Los Ríos)", price: 7.20, date: "2026-06-01" },

        // CAFE
        { product_search: "café", market_name: "Finca Jipijapa / Zaruma (MAG Manabí/Loja)", price: 195.00, date: "2026-06-01" },
        { product_search: "café", market_name: "Finca Puyango (MAG Loja)", price: 190.00, date: "2026-06-01" },

        // LECHE
        { product_search: "leche", market_name: "Finca Machachi / Cayambe (MAG Pichincha)", price: 0.52, date: "2026-06-01" },
        { product_search: "leche", market_name: "Finca Latacunga / Salcedo (MAG Cotopaxi)", price: 0.50, date: "2026-06-01" },
        { product_search: "leche", market_name: "Finca Cuenca / Paute (MAG Azuay)", price: 0.51, date: "2026-06-01" },
        { product_search: "leche", market_name: "Finca Santo Domingo (MAG Santo Domingo)", price: 0.49, date: "2026-06-01" },

        // PRECIOS MAYORISTAS CIUDADES PRINCIPALES
        { product_search: "arroz", market_name: "Mercado Mayorista Quito (SIPA MAG)", price: 41.50, date: "2026-06-01" },
        { product_search: "papa", market_name: "Mercado Mayorista Quito (SIPA MAG)", price: 21.00, date: "2026-06-01" },
        { product_search: "maíz", market_name: "Mercado Mayorista Ambato (SIPA MAG)", price: 18.50, date: "2026-06-01" },
        { product_search: "plátano", market_name: "Mercado Mayorista Guayaquil (SIPA MAG)", price: 11.20, date: "2026-06-01" },
        { product_search: "tomate", market_name: "Mercado Mayorista Cuenca (SIPA MAG)", price: 13.80, date: "2026-06-01" }
    ];

    const recordsToInsert = [];

    for (const item of nationalProducerPrices) {
        const matchedProduct = catalog.find(p => 
            p.name.toLowerCase().includes(item.product_search) && 
            !p.name.toLowerCase().includes('semilla')
        ) || catalog.find(p => p.name.toLowerCase().includes(item.product_search));

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
        // Limpiar para actualizar con el conjunto nacional desglosado por provincia
        await supabase.from('market_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const { data: inserted, error: insertError } = await supabase
            .from('market_prices')
            .insert(recordsToInsert)
            .select();

        if (insertError) {
            console.error("Error al insertar registros nacionales en market_prices:", insertError);
        } else {
            console.log("¡ÉXITO! Se registraron", inserted.length, "precios de productos a nivel nacional desglosados por provincia.");
        }
    }
}

populateNationalMagPrices();
