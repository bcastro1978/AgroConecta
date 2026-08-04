# Módulo 9 / Taller: Entregables Detallados y Completos de Modelado Empresarial
**Proyecto**: AgroConecta — Plataforma Agrotech de Monitoreo Satelital, Trazabilidad EUDR y Mercado B2B  

---

## 📌 1. Cadena de Valor (Michael Porter)
- **Logística de Entrada**: Registro Multi-Perfil (`RegisterForm.tsx`), captura GeoJSON en Leaflet, validación topológica de hectáreas en PostGIS, georreferenciación de sucursales.
- **Operaciones**: Ingesta Sentinel-2/1 SAR (Copernicus CDSE), cálculo NDVI/NDMI/BSI, Conmutación Anti-Nubes SAR (>20%), diagnóstico fitopatológico por agentes de IA (LangGraph/Gemini).
- **Logística de Salida**: Superposición espacial pre-diciembre 2020, emisión de expedientes TRACES NT (GeoJSON/XML), despacho de cotizaciones B2B (`QuoteManager.tsx`).
- **Marketing y Ventas**: Engine de Smart Leads por anomalías foliares, notificación automática a proveedores locales, catálogo B2B categorizado (`products_catalog`) con Tier Pricing.
- **Servicio**: Asistente agronómico 24/7 vía WhatsApp (Meta Webhook), Alertas Tempranas automatizadas, acompañamiento territorial por Branch Managers.
- **Soporte Transversal**: Supabase Auth/PostGIS, Vercel, RLS, Agrónomos, Desarrolladores GIS, Auditores EUDR, APIs Copernicus/Gemini/Global Forest Watch.

---

## 🌊 2. Flujos de Valor (Centrales y Soporte)
- **FC-01 (Central)**: Certificación de Trazabilidad EUDR y Cero Deforestación.
  - *Trigger*: Solicitud de validación de lote de exportación a la UE.
  - *Pasos*: Planificación Lote $\rightarrow$ Captura Poligonal GeoJSON $\rightarrow$ Cruce Capas Pre-2020 $\rightarrow$ Análisis IA Deforestación $\rightarrow$ Dictamen TRACES NT.
  - *Output*: Reporte digital firmado y GeoJSON/XML validado para aduanas europeas.
- **FC-02 (Central)**: Conexión Comercial B2B e Insumos Inteligentes (Smart Leads).
  - *Trigger*: Detección satelital de anomalía o caída de NDVI en finca.
  - *Pasos*: Detección anomalía $\rightarrow$ Matchmaking catálogo B2B $\rightarrow$ Notificación proveedor verificado $\rightarrow$ Cotización/Despacho.
  - *Output*: Productor salva cultivo y Proveedor B2B concreta venta calificada.
- **FS-01 (Soporte)**: Telemetría y Conmutación Satelital Anti-Nubes.
  - *Trigger*: Cronjob batch nocturno de parcelas activas.
  - *Pasos*: Descarga Sentinel-2 $\rightarrow$ Evaluación nubes (>20%) $\rightarrow$ Switch a Sentinel-1 SAR $\rightarrow$ Persistencia PostGIS.
  - *Output*: Serie temporal NDVI ininterrumpida.
- **FS-02 (Soporte)**: Verificación Administrativa y Registro Multi-Perfil.
  - *Trigger*: Creación de cuenta en `RegisterForm.tsx`.
  - *Pasos*: Registro $\rightarrow$ Inserción Supabase Auth $\rightarrow$ Sync `profiles` $\rightarrow$ Verificación Admin/RLS $\rightarrow$ RBAC.
  - *Output*: Usuario autenticado con rol verificado.

---

## 🗺️ 3. Mapa de Capacidades por Niveles (1-3)
1. **Monitoreo Satelital y Teledetección**: Ingesta Sentinel-2/1 (N3), Cálculo NDVI/NDMI (N3), Conmutación Anti-Nubes SAR (N3).
2. **Trazabilidad EUDR y Certificación**: Captura Poligonal GeoJSON (N3), Cruce Histórico Pre-2020 (N3), Dictamen TRACES NT (N3).
3. **Mercado B2B & Smart Leads**: Categorización de Insumos (N3), Tier Pricing (N3), Matchmaking Alertas-Ofertas (N3), Cotizaciones (N3).
4. **Asistencia Agronómica IA**: Agente Fitosanitario (N3), Agente Nutrición/Suelos (N3), WhatsApp Webhook (N3).
5. **Red de Distribución & Sucursales**: Registro de Sucursales (N3), Cobertura Cantonal (N3), Verificación Admin (N3).
6. **Gobernanza & RBAC**: Autenticación Auth (N3), Control RBAC 4 roles (N3), Postgres RLS (N3), Ofuscación Geográfica (N3).

---

## 📋 4. Matriz de Componentes Operativos (4 Pilares)
- **Personas**: Productor, Proveedor B2B, Comprador EU, Auditor Ambiental, Agente IA.
- **Información**: GeoJSON, Coordenadas ref, `products_catalog`, `marketplace_listings`, `b2b_leads`, Certificado EUDR.
- **Procesos**: Conmutación Anti-Nubes (>20% nubes), validación PostGIS, matchmaking geolocalizado, autenticación RLS.
- **Recursos**: API Copernicus CDSE, Supabase Postgres/PostGIS, Gemini 1.5 Pro, Leaflet, Global Forest Watch.

---

## 🚀 5. Oportunidades de Mejora (OM)
- **OM-01**: Conmutación automática a Radar SAR Sentinel-1 cuando nubosidad >20%.
- **OM-02**: Engine de matchmaking predictivo en tiempo real entre anomalías agronómicas y catálogo de proveedores locales.
- **OM-03**: Integración vía Webhook directo con el portal oficial TRACES NT de la Unión Europea.

---

## 🎨 6. Guía de Modelado Visual ArchiMate & Prompt
- **Capa Estrategia**: Flujos `FC-01`, `FC-02`, `FS-01`, `FS-02` y Capacidades Niveles 1-3.
- **Capa Negocio**: Actores (Productor, Proveedor B2B, Exportador) y Objetos (`products_catalog`, GeoJSON, Alerta).
- **Capa Aplicación**: `ProducerDashboard`, `SupplierDashboard`, `B2BListingForm`, `B2BLeadsMap`, API Copernicus, Supabase Auth.
