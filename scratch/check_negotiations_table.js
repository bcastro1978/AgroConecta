import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkNegotiationsSchema() {
    console.log("Verificando registros en tabla 'negotiations'...");

    const { data: negs, error } = await supabase
        .from('negotiations')
        .select(`
            *,
            listing:listing_id (
                *,
                product:product_id(*)
            ),
            producer:producer_id(*),
            buyer:buyer_id(*)
        `)
        .limit(10);

    if (error) {
        console.error("Error al consultar negotiations:", error);
    } else {
        console.log(`Registros encontrados en negotiations: ${negs ? negs.length : 0}`);
        if (negs && negs.length > 0) {
            console.log("Ejemplo de negociación:", JSON.stringify(negs[0], null, 2));
        }
    }
}

checkNegotiationsSchema();
