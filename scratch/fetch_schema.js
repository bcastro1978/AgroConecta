const SUPABASE_URL = 'https://kqecqrekjabvfhltqzpb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMzYxNywiZXhwIjoyMDg1MDg5NjE3fQ.-rwhMESGonsz8pB1yT0f-lkHTVJ6v1XY06BticKAZJc';

async function fetchSchema() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Accept': 'application/openapi+json'
            }
        });
        const openApiSpec = await response.json();
        
        if (openApiSpec.definitions && openApiSpec.definitions.market_prices) {
            console.log("market_prices properties:", JSON.stringify(openApiSpec.definitions.market_prices.properties, null, 2));
        } else {
            console.log("Keys in definitions:", Object.keys(openApiSpec.definitions || {}));
        }

        if (openApiSpec.parameters) {
            console.log("Parameters matching market:", Object.keys(openApiSpec.parameters).filter(k => k.includes('market')));
        }
    } catch (e) {
        console.error("Error fetching schema:", e);
    }
}

fetchSchema();
