import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

async function fetchEnumValues() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Accept': 'application/openapi+json'
        }
    });

    const openapi = await res.json();
    const negStatus = openapi.definitions?.negotiations?.properties?.status;
    console.log("negotiations.status definition:", JSON.stringify(negStatus, null, 2));
}

fetchEnumValues();
