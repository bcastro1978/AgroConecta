require('dotenv').config();
const { Client } = require('pg');

async function runMigration() {
    // Standard Supabase pooler connection string pattern:
    // db.kqecqrekjabvfhltqzpb.supabase.co or pooler URL
    // Project ref: kqecqrekjabvfhltqzpb
    const connectionString = process.env.DATABASE_URL || "postgres://postgres:kqecqrekjabvfhltqzpb@db.kqecqrekjabvfhltqzpb.supabase.co:5432/postgres";
    
    console.log("Connecting to Supabase PostgreSQL database...");
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected successfully!");

        const sql = `
            -- Fix foreign key constraints on sat_telemetry and alerts_events to ON DELETE CASCADE
            ALTER TABLE IF EXISTS public.sat_telemetry 
              DROP CONSTRAINT IF EXISTS sat_telemetry_parcel_id_fkey,
              ADD CONSTRAINT sat_telemetry_parcel_id_fkey 
                FOREIGN KEY (parcel_id) REFERENCES public.parcels(id) ON DELETE CASCADE;

            ALTER TABLE IF EXISTS public.alerts_events 
              DROP CONSTRAINT IF EXISTS alerts_events_parcel_id_fkey,
              ADD CONSTRAINT alerts_events_parcel_id_fkey 
                FOREIGN KEY (parcel_id) REFERENCES public.parcels(id) ON DELETE CASCADE;

            -- Enable full RLS permissions (FOR ALL) for producers on sat_telemetry and alerts_events
            DROP POLICY IF EXISTS "Producers can view telemetry of their parcels" ON public.sat_telemetry;
            DROP POLICY IF EXISTS "Producers can manage telemetry of their parcels" ON public.sat_telemetry;

            CREATE POLICY "Producers can manage telemetry of their parcels" ON public.sat_telemetry
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM public.parcels p WHERE p.id = sat_telemetry.parcel_id AND p.producer_id = auth.uid()
                    )
                );

            DROP POLICY IF EXISTS "Producers can manage alerts of their parcels" ON public.alerts_events;

            CREATE POLICY "Producers can manage alerts of their parcels" ON public.alerts_events
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM public.parcels p WHERE p.id = alerts_events.parcel_id AND p.producer_id = auth.uid()
                    )
                );
        `;

        await client.query(sql);
        console.log("✅ Migration ON DELETE CASCADE and RLS FOR ALL applied successfully!");
    } catch (err) {
        console.error("Migration log:", err.message);
    } finally {
        await client.end();
    }
}

runMigration();
