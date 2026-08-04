import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkListings() {
    console.log("Consultando ofertas en marketplace_listings...");

    const { data: listings, error } = await supabase
        .from('marketplace_listings')
        .select(`
            *,
            product:product_id(*),
            producer:producer_id(*)
        `);

    if (error) {
        console.error("Error al consultar marketplace_listings:", error);
        return;
    }

    console.log(`Total publicaciones encontradas: ${listings ? listings.length : 0}`);

    if (listings && listings.length > 0) {
        listings.forEach(l => {
            console.log(`ID: ${l.id} | Producto: ${l.product?.name} | Productor: ${l.producer?.full_name} | Cantidad: ${l.quantity} | Precio: ${l.price_unit} | Status: ${l.status}`);
        });
    }
}

checkListings();
