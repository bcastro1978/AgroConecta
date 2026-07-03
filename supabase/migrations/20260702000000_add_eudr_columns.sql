-- Migración para añadir campos de cumplimiento EUDR y TRACES NT
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS eudr_status VARCHAR(50) DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS is_deforestation_free BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS eudr_validation_details JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS traces_nt_geojson JSONB DEFAULT NULL;

-- Función para verificar validez geométrica usando PostGIS
CREATE OR REPLACE FUNCTION public.check_geometry_validity(geom_wkt text)
RETURNS TABLE (is_valid boolean, reason text) AS $$
DECLARE
    g geometry;
BEGIN
    g := ST_GeomFromText(geom_wkt, 4326);
    RETURN QUERY SELECT ST_IsValid(g), ST_IsValidReason(g);
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar solapamientos con parcelas existentes
CREATE OR REPLACE FUNCTION public.check_geometry_overlaps(geom_wkt text, exclude_id uuid DEFAULT NULL)
RETURNS TABLE (overlapping_parcel_id uuid, overlap_area_hectares double precision) AS $$
DECLARE
    g geometry;
BEGIN
    g := ST_GeomFromText(geom_wkt, 4326);
    RETURN QUERY 
    SELECT id, ST_Area(ST_Intersection(geom, g)::geography) / 10000.0
    FROM public.parcels
    WHERE (exclude_id IS NULL OR id <> exclude_id)
      AND ST_Intersects(geom, g)
      AND ST_Area(ST_Intersection(geom, g)) > 0.0000001; -- Umbral mínimo para ignorar toques de borde
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
