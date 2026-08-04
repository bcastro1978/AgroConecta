import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTM2MTcsImV4cCI6MjA4NTA4OTYxN30.ZkG42oO9R8xWJ4G6R7m9gQxY9k9n9z9x9y9z9x9y9z9';

// Usar Service Key para verificar consulta con cliente
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testQuery() {
    console.log("Probando consulta de MarketplaceBrowser...");

    const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
            *,
            product:product_id(*),
            producer:producer_id(full_name, location_ref_lat, location_ref_lng)
        `)
        .eq('status', 'Active');

    if (error) {
        console.error("ERROR EN CONSULTA POSTGREST:", error);
    } else {
        console.log("¡Consulta exitosa! Data devuelta:", JSON.stringify(data, null, 2));
    }
}

testQuery();
