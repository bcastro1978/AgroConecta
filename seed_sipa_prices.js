import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const SIPA_PRODUCTS = [
    { name: 'Cacao Sabor y Aroma', category: 'Agroexportación', unit: 'Quintal (100 lb)', price: 345.00, market: 'Guayaquil (Mercado Mayorista)' },
    { name: 'Arroz Flor (En cáscara)', category: 'Cereales', unit: 'Quintal (100 lb)', price: 41.50, market: 'Quito (Mercado Mayorista)' },
    { name: 'Papa Chola (Calibre 1)', category: 'Tubérculos', unit: 'Saco (45 kg)', price: 21.00, market: 'Quito (Mercado Mayorista)' },
    { name: 'Maíz Duro Amarillo (Seco)', category: 'Cereales', unit: 'Quintal (100 lb)', price: 18.50, market: 'Ambato (Mercado Mayorista)' },
    { name: 'Plátano Barraganete', category: 'Frutas', unit: 'Caja (50 lb)', price: 11.20, market: 'Guayaquil (Mercado Mayorista)' },
    { name: 'Tomate Riñón Mayorista', category: 'Hortalizas', unit: 'Caja (20 kg)', price: 13.80, market: 'Cuenca (Mercado Mayorista)' },
    { name: 'Cebolla Colorada Seca', category: 'Hortalizas', unit: 'Quintal (100 lb)', price: 24.50, market: 'Quito (Mercado Mayorista)' },
    { name: 'Aguacate Hass Tipo Exportación', category: 'Frutas', unit: 'Caja (10 kg)', price: 16.50, market: 'Quito (Mercado Mayorista)' }
];

async function seedSipaPrices() {
    console.log('🌱 Poblando catálogo de productos y precios referenciales SIPA...');

    for (const item of SIPA_PRODUCTS) {
        // 1. Insertar o recuperar producto del catálogo
        let { data: catalogItem } = await supabase
            .from('products_catalog')
            .select('id')
            .eq('name', item.name)
            .single();

        if (!catalogItem) {
            const { data: newCatalog, error: catErr } = await supabase
                .from('products_catalog')
                .insert({
                    name: item.name,
                    category: item.category,
                    unit: item.unit
                })
                .select()
                .single();

            if (catErr) {
                console.error(`Error creando producto ${item.name}:`, catErr.message);
                continue;
            }
            catalogItem = newCatalog;
        }

        if (catalogItem) {
            // 2. Insertar precio de mercado
            const { error: priceErr } = await supabase
                .from('market_prices')
                .insert({
                    product_id: catalogItem.id,
                    price: item.price,
                    market_name: item.market,
                    date: new Date().toISOString()
                });

            if (priceErr) {
                console.error(`Error guardando precio para ${item.name}:`, priceErr.message);
            } else {
                console.log(`✅ Precio SIPA registrado: ${item.name} -> $${item.price} en ${item.market}`);
            }
        }
    }

    console.log('✨ Semilla de Precios SIPA completada.');
}

seedSipaPrices();
