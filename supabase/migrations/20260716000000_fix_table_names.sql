-- 20260716000000_fix_table_names.sql
-- Renombrar tablas para sincronizar migraciones con el código base

ALTER TABLE IF EXISTS public.satellite_analyses RENAME TO sat_telemetry;
ALTER TABLE IF EXISTS public.agricultural_leads RENAME TO alerts_events;
