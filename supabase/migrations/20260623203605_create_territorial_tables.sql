-- Habilitar extensión PostGIS para datos espaciales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Parcelas
CREATE TABLE public.parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    canton VARCHAR(100) NOT NULL,
    parish VARCHAR(100) NOT NULL,
    geom geometry(Polygon, 4326) NOT NULL, -- Coordenadas del polígono en WGS 84
    area_hectares DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Análisis Satelitales (Copernicus)
CREATE TABLE public.satellite_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    image_url TEXT, -- URL de la imagen extraída de Copernicus
    ndvi_score DECIMAL, -- Índice de salud del cultivo
    detected_crop VARCHAR(100), -- Cultivo detectado por el agente
    raw_agent_response JSONB, -- Respuesta cruda del agente de análisis satelital
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Leads Agrícolas (Necesidades deducidas)
CREATE TABLE public.agricultural_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.satellite_analyses(id) ON DELETE CASCADE,
    need_type VARCHAR(50) NOT NULL, -- Ej: 'Fertilizante', 'Pesticida', 'Riego'
    description TEXT NOT NULL, -- Detalle de la deducción (ej. "Para mejorar X debido al bajo NDVI")
    status VARCHAR(50) DEFAULT 'Pendiente', -- Estado del lead (Pendiente, Contactado, Cerrado)
    suggested_products TEXT[], -- Lista de productos o servicios sugeridos (para proteger, mejorar, reducir pérdidas)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices geoespaciales y de búsqueda
CREATE INDEX idx_parcels_geom ON public.parcels USING GIST (geom);
CREATE INDEX idx_parcels_location ON public.parcels (province, canton, parish);
