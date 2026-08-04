# Handoff Report: Supabase Backend Technical Audit

## 1. Observation

During the read-only technical audit of the Supabase backend configuration under the `supabase/` directory and its comparison with the requirements in the Obsidian vault (`docs/AgroConecta/`), several key discrepancies and omissions were identified.

### A. Missing Tables in Migrations
The migrations directory (`supabase/migrations/`) contains only three SQL files:
1. `20260623203605_create_territorial_tables.sql`
2. `20260702000000_add_eudr_columns.sql`
3. `20260702010000_add_email_and_phone_to_users.sql`

These migration files only create or modify `public.parcels`, `public.satellite_analyses`, `public.agricultural_leads`, and alter a table named `public.users`.
However, the frontend code and Python AI agent API require and query multiple other tables that are entirely absent from the migration files:
*   **Marketplace Tables:** `products_catalog`, `marketplace_listings`, `negotiations`, `market_prices`, `buyer_demands`.
    *   *Frontend evidence:* `src/components/market/AdminPriceManager.tsx:35` (`supabase.from('products_catalog')`), `src/components/market/B2BListingForm.tsx:60` (`supabase.from('marketplace_listings')`), `src/components/market/MarketplaceBrowser.tsx:64` (`supabase.from('negotiations')`).
*   **Associatividad Tables:** `associations`, `association_members`.
    *   *Frontend evidence:* `src/components/market/AssociationInbox.tsx:44` (`supabase.from('associations')`), `src/components/market/AssociationManager.tsx:87` (`supabase.from('association_members')`).
*   **Intelligence & Core Tables:** `crop_recommendations`, `agent_memory_state`, `provider_branches`.
    *   *Evidence:* `src/components/dashboard/copernicus/CropDiscovery.tsx:19` (`supabase.from('crop_recommendations')`), `src/components/dashboard/BranchManager.tsx:47` (`supabase.from('provider_branches')`), and python backend `agro_agents_api/main.py:22` (`supabase.table('agent_memory_state')`).

### B. User / Profile Table Mismatch and Missing Table Creation
*   **Missing Table Creation:** No migration file creates the `public.users` table. The migration `20260702010000_add_email_and_phone_to_users.sql` only runs:
    ```sql
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
    ```
*   **Trigger Binding Mismatch:** The trigger function `handle_new_user()` is defined in `20260702010000_add_email_and_phone_to_users.sql` (lines 4–40), but the SQL command to actually bind it as a trigger to the `auth.users` table (e.g. `CREATE TRIGGER ...`) is completely missing from the migrations.
*   **Inconsistent Naming:** The seeding script `seed_carchi.js` queries and inserts into a table named `profiles`:
    ```javascript
    // seed_carchi.js lines 16 and 19
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('id', producerId).single();
    const { error: profileErr } = await supabase.from('profiles').insert({ ... });
    ```
    However, the frontend code (`AuthProvider.tsx:48`, `AdminDashboard.tsx:18`) and migrations write to `users` rather than `profiles`.

### C. Copernicus Telemetry & Alerts Table Mismatch
There is a direct naming and structural mismatch between the tables created in the SQL migrations and those queried by the code:
*   **Satellite Telemetry:** Migration `20260623203605_create_territorial_tables.sql` creates:
    ```sql
    CREATE TABLE public.satellite_analyses ( ... )
    ```
    But the Deno edge function `sync-single-parcel/index.ts` and the frontend (`AgronomicHealth.tsx`) insert and query from a table called `sat_telemetry`:
    ```typescript
    // sync-single-parcel/index.ts line 179
    const { error: telErr } = await supabase.from('sat_telemetry').insert({ ... })
    ```
*   **Alerts & Leads:** Migration creates:
    ```sql
    CREATE TABLE public.agricultural_leads ( ... )
    ```
    But the edge function `sync-single-parcel/index.ts` and frontend insert and query from `alerts_events`:
    ```typescript
    // sync-single-parcel/index.ts line 205
    await supabase.from('alerts_events').insert({ ... })
    ```
    Furthermore, B2B leads map page (`B2BLeadsMap.tsx:43`) and python API query `b2b_smart_leads` and `b2b_providers` instead of `agricultural_leads`.

### D. Row-Level Security (RLS) Policies
Despite the business specifications demanding RLS policies to isolate tenants (Productores vs. Proveedores) specified in `Backend_y_Datos.md` (lines 49-53), there are **no RLS activation commands or security policies** defined in any of the three SQL migration files. 
*   `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` is completely missing.
*   `CREATE POLICY ...` statements are completely missing.

### E. Edge Functions Status
*   **`start-territorial-analysis`:** The function in `supabase/functions/start-territorial-analysis/index.ts` has its core agéntic processing pipeline commented out:
    ```typescript
    // supabase/functions/start-territorial-analysis/index.ts lines 30-41
    // const processTerritorialAnalysis = async () => {
    //   1. [Agente Trazador] Generar polígonos
    //   ...
    // }
    ```
    It only returns a static success JSON payload. It is **mock-only**.
*   **`sync-single-parcel`:** The function in `supabase/functions/sync-single-parcel/index.ts` is fully operational in communicating with Sentinel Hub API, extracting true-color RGB/raster images, and saving calculations (NDVI, NDMI, BSI) to the database. However, it targets the non-existent `sat_telemetry` and `alerts_events` tables.

---

## 2. Logic Chain

1.  **Missing Entities:** Since the frontend (`B2BListingForm.tsx`, `MarketplaceBrowser.tsx`, `AssociationManager.tsx`) queries tables like `marketplace_listings`, `negotiations`, `associations`, and `provider_branches` which are not created in the database migrations under `supabase/migrations/`, any deployment of the Supabase backend from the current migration history will fail to run the frontend because the tables do not exist in the database (resulting in database query failures).
2.  **User Trigger Failures:** Because the `CREATE TRIGGER` statement to link `handle_new_user()` to `auth.users` is missing from the migration files, when a user registers through Supabase Auth, the mirror profile in `public.users` will never be automatically created. This leads to user authorization flow breakage (orphaned users).
3.  **Table Mismatch:** Because the edge function `sync-single-parcel` and frontend query `sat_telemetry` and `alerts_events` instead of `satellite_analyses` and `agricultural_leads` (which are the ones created by the migrations), any attempt to sync Copernicus telemetry or view alerts on the dashboard will throw `PGRST116` or table-not-found database errors.
4.  **Security Risks:** Because RLS policies are completely missing from the migration scripts, if the tables are created, they will either be entirely accessible to anonymous users (if public schema grants are active) or completely restricted, but no tenant isolation (Producers only viewing their own parcels) will be enforced at the database level.
5.  **Mocked Orchestration:** Because `start-territorial-analysis` is commented out, triggering a regional territorial analysis will not invoke any LLM agents or populate the database with new parcels automatically; it will only return a placeholder response.

---

## 3. Caveats

*   **Offline/Mock Testing:** Since command line tool executions (`node scratch/test_tables.js`) and `.env` decryption timed out due to user permission requirements, table presence inside the running Supabase instance was verified entirely via code static analysis and documentation audit. 
*   **Alternative Environments:** We assume that the production/development database might have been updated manually (Ad-Hoc SQL editor executions in the Supabase Dashboard) without backing up the changes to the migration files.

---

## 4. Conclusion

The Supabase backend setup is **partially operational but contains critical discrepancies** that prevent it from being correctly built, run locally, or synced with the frontend and agent API from clean migrations:
1.  **Fully Operational Logic:** The Copernicus OAuth and statistics extraction inside `sync-single-parcel` edge function, and the Python-based EUDR processing (`eudr_processor.py`).
2.  **Mock-Only/Inoperative Logic:** The `start-territorial-analysis` edge function (completely mocked) and the trigger link between `auth.users` and `public.users`.
3.  **Critical Database Mismatch:** Mismatches between migrations and actual table names/structures (`satellite_analyses` vs. `sat_telemetry`; `agricultural_leads` vs. `alerts_events`).
4.  **Missing Tables & Security:** Complete lack of Marketplace, Associatividad, and Agent state tables in the migrations directory, along with a complete absence of RLS configurations.

---

## 5. Verification Method

To verify these findings independently, do the following:
1.  **Check migration tables:** Open `supabase/migrations/20260623203605_create_territorial_tables.sql` and verify that `satellite_analyses` and `agricultural_leads` are created instead of `sat_telemetry` and `alerts_events`.
2.  **Verify RLS Absence:** Search for the word `ROW LEVEL SECURITY` or `POLICY` inside `supabase/migrations/` (no results will return).
3.  **Check missing tables:** Look for any SQL statements containing `CREATE TABLE public.marketplace_listings` or `CREATE TABLE public.products_catalog` inside the `supabase/migrations/` files (they do not exist).
4.  **Inspect Trigger Binding:** Open `supabase/migrations/20260702010000_add_email_and_phone_to_users.sql` and confirm there is no `CREATE TRIGGER` statement.
5.  **Examine Edge Function code:** Open `supabase/functions/start-territorial-analysis/index.ts` and verify that lines 28–41 containing `processTerritorialAnalysis` are fully commented out.
