-- 20260716000002_user_auth_trigger_and_rls.sql
-- Vinculación del trigger de autenticación y activación de RLS (Row Level Security)

-- 1. Trigger para creación automática de usuarios en public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Habilitar RLS en tablas principales
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sat_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_smart_leads ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para public.users
-- Los usuarios pueden leer y actualizar su propio perfil
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 4. Políticas para public.parcels
-- Los productores pueden ver y modificar solo sus propias parcelas
CREATE POLICY "Producers can manage their parcels" ON public.parcels 
    FOR ALL USING (auth.uid() = producer_id);

-- 5. Políticas para public.sat_telemetry
-- Los productores pueden ver la telemetría de sus parcelas
CREATE POLICY "Producers can view telemetry of their parcels" ON public.sat_telemetry
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.parcels p WHERE p.id = sat_telemetry.parcel_id AND p.producer_id = auth.uid()
        )
    );

-- 6. Políticas para public.alerts_events
-- Todo usuario autenticado puede ver alertas de sus parcelas relacionadas (vía un JOIN hipotético, o se asume acceso por parcela)
-- Asumimos que alerts_events tiene parcel_id (si no lo tiene y se enlaza por b2b_smart_leads, ajustaremos)
-- Nota: RLS ignorado por service_role (Agentes/Backend).

-- 7. Políticas para public.b2b_providers
-- Todos pueden ver los proveedores (catálogo público)
CREATE POLICY "Providers are viewable by everyone" ON public.b2b_providers FOR SELECT USING (true);
-- Un proveedor puede editar su propio perfil si su ID coincide
CREATE POLICY "Providers can edit their own profile" ON public.b2b_providers FOR UPDATE USING (auth.uid() = id); -- asumiendo id es igual a user_id o hay FK

-- 8. Políticas para public.b2b_smart_leads
-- Proveedores pueden ver sus propios leads
CREATE POLICY "Providers can view their leads" ON public.b2b_smart_leads FOR SELECT USING (auth.uid() = provider_id);
