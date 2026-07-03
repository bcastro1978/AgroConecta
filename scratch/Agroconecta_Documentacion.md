# AGROCONECTA
**Documento Funcional y Técnico Completo**
*Versión Generada para Replicación Completa de la Plataforma*

## 1. Visión General del Sistema y Objetivos
**AgroConecta** es una plataforma web B2B (Business-to-Business) diseñada para el mercado agrícola (inicialmente Ecuador). Su objetivo principal es conectar a productores agrícolas, compradores industriales (hospitales, hoteles, restaurantes, exportadoras), proveedores de insumos/servicios y transportistas dentro de un ecosistema impulsado por **inteligencia artificial** y **telemetría satelital (Copernicus)**.

### Objetivos Principales:
1. **Eliminar Intermediarios:** Permitir a los productores vender sus cosechas directamente a compradores a precios justos y transparentes.
2. **Decisiones Basadas en Datos:** Proveer a los agricultores datos satelitales (salud del cultivo, clima, humedad) sin costo prohibitivo.
3. **Asesoría Continua (AAAS):** Proveer asesoría agronómica IA 24/7 mediante agentes conversacionales accesibles vía web y WhatsApp.
4. **Fomentar la Asociatividad:** Permitir que pequeños productores formen consorcios para satisfacer demandas masivas de grandes compradores.
5. **Generar Leads Inteligentes:** Ayudar a proveedores de insumos a identificar oportunidades de venta precisas (B2B Smart Leads) basándose en diagnósticos satelitales.

## 2. Actores y Roles de Usuario
El sistema implementa un control de acceso basado en perfiles con Row-Level Security (RLS) de Supabase. Todos inician en estado `Pending` hasta ser verificados.

### 2.1 Productor
**Descripción:** Agricultor que registra y monitorea sus parcelas, publica cosechas y puede asociarse.
**Dashboard (Producer Command):**
- **Publicar:** Crea ofertas con precios por volumen (Tier Pricing).
- **Cotizaciones:** Gestiona negociaciones entrantes.
- **Mercado:** Ve demandas masivas de compradores cercanos.
- **Asociaciones:** Forma o se une a consorcios en un radio de 50 km.
- **Mapa CDSE / Diagnóstico:** Registra parcelas (GeoJSON) y visualiza índices satelitales (NDVI, NDMI, BSI) y recibe recomendaciones.
- **Discovery IA:** Recibe recomendaciones de reconversión de cultivos por IA (ej. cambiar de cultivo si es más rentable).

### 2.2 Comprador
**Descripción:** Empresa procesadora, exportadora o de retail que compra al por mayor.
**Dashboard (Procurement Terminal):**
- **Explorar:** Navega el catálogo B2B, con indicadores de "Cultivo Validado Satelitalmente".
- **Mis Demandas:** Publica necesidades masivas (DemandForm).
- **Cotizaciones:** Negocia precios y cantidades directamente.

### 2.3 Proveedor
**Descripción:** Empresa de insumos (fertilizantes, riego, maquinaria) o servicios agrícolas.
**Dashboard (Supplier Terminal):**
- **Inteligencia (Heatmap y Leads):** Mapa geoespacial donde los B2B Smart Leads le indican qué parcela necesita sus insumos de acuerdo al satélite.
- **Ofertar:** Publica su catálogo de productos.
- **Sucursales:** Administra puntos de atención y cobertura.

### 2.4 Administrador (Admin)
**Descripción:** Operador de la plataforma.
**Dashboard (Root Control):**
- **Verificación:** Aprueba o rechaza usuarios nuevos (Cédula, RUC, Título de Propiedad).
- **Precios de Mercado:** Inyecta precios de referencia para guiar las negociaciones.

## 3. Funcionalidad Técnica (Módulos para Replicar)

### 3.1 Marketplace B2B y Negociación
- **Publicaciones:** Tienen precios escalonados (Tier Pricing) y Cantidad Mínima de Pedido (MOQ).
- **Negociación Bidireccional:** Compradores envían cotizaciones y productores responden (Aceptar, Rechazar, Contraofertar).
- **Demandas Masivas:** Compradores publican lo que necesitan comprar.

### 3.2 Inteligencia Satelital (Copernicus CDSE)
- **Monitoreo:** El productor dibuja un polígono (GeoJSON). El backend descarga datos de Sentinel-2 (óptico) y Sentinel-1 (radar SAR).
- **Índices Calculados:**
  - **NDVI:** Vigor vegetativo (Rango -1 a 1, >0.4 óptimo).
  - **NDMI:** Humedad/estrés hídrico.
  - **BSI:** Índice de suelo desnudo/salinidad.
  - **VV / VH (SAR):** Retrodispersión de radar para biomasa y rugosidad.

### 3.3 Motor Multi-Agente (LangGraph + Gemini)
El núcleo de la inteligencia. Expone una API consumida por WhatsApp (vía n8n y Twilio) y el portal web.
- **Supervisor (Coordinator):** Recibe el mensaje, busca contexto de la parcela y enruta al experto.
- **Meteorologist:** Condiciones atmosféricas.
- **Irrigation Specialist:** Analiza el NDMI y sugiere riego.
- **Nutritional Specialist:** Analiza el NDVI y recomienda fertilizantes.
- **Pest Specialist:** Analiza fotos (visión) y clima para detectar plagas.
- **Harvest Coordinator:** Momento óptimo de cosecha.
- **Economic Analyst:** Recomienda proveedores B2B.
- **Memoria:** Uso de `agent_memory_state` para mantener el hilo de la conversación (thread_id) usando RAG con `pgvector`.

### 3.4 B2B Smart Leads
- A través del análisis masivo (batching) de telemetría, el sistema detecta problemas en parcelas y genera alertas que se transforman en *leads* (oportunidades) georreferenciados para los proveedores, segmentados por categoría (Insumo, Maquinaria, Riego).

### 3.5 Módulo de Asociatividad
- Productores dentro de un radio de 50 km pueden agruparse para consolidar un volumen mayor (ej. llenar un contenedor para exportación).

## 4. Arquitectura y Stack Tecnológico
Para replicar esta plataforma, se debe configurar la siguiente pila tecnológica:

- **Frontend:** React 18 (SPA), TypeScript, Vite, Tailwind CSS, componentes Lucide. Mapas interactivos con React Leaflet y OpenStreetMap.
- **Backend (BaaS):** Supabase (PostgreSQL, Row-Level Security, Auth basado en JWT, Storage y Edge Functions).
- **Base de Datos:** PostgreSQL con soporte de `pgvector` para Embeddings y RAG, almacenando geometrías (GIS / GeoJSON).
- **Agentes IA y API:** Python 3.x, FastAPI, LangChain, LangGraph.
- **Modelo de Lenguaje (LLM):** Google Gemini 2.5 Flash.
- **Datos Satelitales:** Integración con API de Copernicus Data Space Ecosystem (CDSE) de la ESA.
- **Automatización de Mensajería:** n8n (flujos de trabajo) y Twilio (WhatsApp Business API) conectados al backend de Python.

## 5. Esquema Base de Datos a Replicar (PostgreSQL / Supabase)
La base de datos debe contemplar al menos las siguientes entidades estructuradas por módulos:
1. **Core:** `users`, `product_catalog`, `marketplace_listings`, `negotiations`, `market_prices`.
2. **Asociatividad:** `associations`, `association_members`, `buyer_demands`.
3. **Satélite:** `parcels` (con `producer_id`, `active_crop`, `geometry`), `sat_telemetry`, `alerts_events`.
4. **Inteligencia:** `crop_recommendations`, `b2b_smart_leads`.
5. **Agentes:** `agent_memory_state` (JSONB), tablas con embeddings vía `pgvector`.

## 6. Modelo de Negocio (Para Sostenibilidad de Réplica)
- **Productores:** Suscripción Freemium (1 parcela gratis, cobro por análisis avanzado) o comisión por transacción.
- **Proveedores:** Suscripción mensual por niveles (pago por acceso a mapa de Smart Leads B2B).
- **Compradores:** "Listings Premium" para demandas destacadas.
