import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findValidEnum() {
    const candidates = [
        'Manual', 'CSV', 'Scraper', 'API', 'Admin', 'User', 'System', 'External',
        'manual', 'csv', 'scraper', 'api', 'admin', 'user', 'system', 'external'
    ];
    
    const { data: catalog } = await supabase.from('products_catalog').select('id').limit(1);
    if (!catalog || catalog.length === 0) return;
    const prodId = catalog[0].id;

    for (const val of candidates) {
        const { data, error } = await supabase.from('market_prices').insert({
            product_id: prodId,
            market_name: 'Test Market',
            source_type: val,
            price: 10.0,
            date: '2026-06-01'
        }).select();

        if (error) {
            console.log(`Fallo [${val}]:`, error.message);
        } else {
            console.log("¡ÉXITO! El valor de enum válido es:", val);
            await supabase.from('market_prices').delete().eq('id', data[0].id);
            break;
        }
    }
}

findValidEnum();
