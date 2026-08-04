# Reporte de Auditoría Técnica y Plan de Acción — AgroConecta

Este documento presenta una auditoría técnica funcional y conceptual exhaustiva del estado actual del proyecto AgroConecta, estructurado en tres componentes principales: el Frontend (React 19), la Base de Datos (Supabase/PostgreSQL) y el Backend de Inteligencia Artificial (FastAPI + LangGraph). Concluye con un plan de acción priorizado para finalizar la implementación y lograr la operatividad total de la plataforma.

---

## 1. Clasificación y Evaluación de Componentes

### Componente A: Frontend (React 19 + Vite + Leaflet)
**Estado General:** Altamente funcional y avanzado en términos de interfaz de usuario y flujos cliente base, pero con inconsistencias en reportes y desajustes con respecto a la especificación de Obsidian.

*   **Funcionalidades Totalmente Operativas:**
    *   **Autenticación y RBAC (`src/components/auth/AuthProvider.tsx`, `RegisterForm.tsx`):** Contexto de autenticación en tiempo real conectado a Supabase. Manejo de reintentos automáticos para evitar condiciones de carrera al crear perfiles. El registro captura metadatos de georreferenciación móvil (GPS nativo o selector en mapa).
    *   **Visualización Geoespacial del Productor (`src/components/dashboard/copernicus/ProducerParcels.tsx`):** Mapa interactivo de Leaflet con capas conmutables. Permite dibujar parcelas manualmente o capturar polígonos caminando los límites en tiempo real mediante `navigator.geolocation.watchPosition`. Capa `ImageOverlay` para renderizar firmas NDVI directamente sobre la parcela.
    *   **Flujo Comercial B2B (`src/pages/B2BLeadsMap.tsx`, `MarketplaceBrowser.tsx`):** Visor de leads para proveedores (radar de parcelas afectadas) y mapa de calor de demanda (`HeatmapDemand.tsx`) usando marcadores circulares difuminados para protección de privacidad. Marketplace con etiquetas de "Cultivo Validado Satelitalmente" e interacción con cotizaciones.

*   **Funcionalidades Parcialmente Operativas / Simuladas:**
    *   **Análisis Territorial Administrativo (`src/components/admin/TerritorialAnalysis.tsx`, `AnalysisResults.tsx`):** La simulación de extracción en el administrador no es una consulta en tiempo real; realiza un retardo de 2.5s y desplaza un conjunto de geometrías estáticas precargadas (`initialMockParcels`) para ubicarlas en el cantón seleccionado. Si la API de Python en el puerto 8000 no responde, el frontend recurre a un `catch` de simulación con descarga de GeoJSON ficticio en el navegador.

*   **Bugs Críticos e Inconsistencias:**
    *   **Bug de Fechas en PDF de Trazabilidad (`src/components/dashboard/copernicus/TraceabilityReport.tsx`):** Al ordenar y mostrar el historial de telemetría en el PDF del certificado EUDR, se intenta leer la propiedad `t.created_at` (Líneas 73, 76, 189). Sin embargo, el select inicial en `AgronomicHealth.tsx` (Línea 36) proyecta únicamente `timestamp` desde Supabase. Esto hace que `t.created_at` sea `undefined` y el PDF muestre la fecha como **"Invalid Date"**.
    *   **Desajuste de Rol en `BranchManager.tsx`:** Especificado en el Módulo 8 (Obsidian) como panel de control macro-geográfico para ONGs y Directores Regionales (WIPO GREEN). En el código real, es un editor CRUD sencillo para que los proveedores B2B registren sus sucursales físicas (`provider_branches`).
    *   **Vistas Huérfanas (Código Muerto):** `src/components/producer/ParcelManager.tsx` (reemplazado por `ProducerParcels.tsx` pero no eliminado) y `src/components/dashboard/copernicus/SmartLeads.tsx` (sin importaciones ni rutas activas en los dashboards).

---

### Componente B: Base de Datos y Backend BaaS (Supabase)
**Estado General:** Parcialmente operativo. El backend posee las bases de integración de Copernicus en Edge Functions, pero carece de esquemas esenciales en las migraciones de base de datos y de controles de seguridad de nivel de fila (RLS).

*   **Funcionalidades Totalmente Operativas:**
    *   **Edge Function `sync-single-parcel` (`supabase/functions/sync-single-parcel/index.ts`):** Consulta exitosamente CDSE de Sentinel Hub, extrae imágenes raster y calcula estadísticas espectrales (NDVI, NDMI, BSI).

*   **Funcionalidades Parcialmente Operativas / Simuladas / Inoperativas:**
    *   **Edge Function `start-territorial-analysis` (`supabase/functions/start-territorial-analysis/index.ts`):** Toda la lógica de procesamiento multi-agente está comentada en el código (Líneas 30-41). Retorna un JSON de éxito estático. Es **mock-only**.
    *   **Falta de Enlace de Trigger de Usuarios:** La función `handle_new_user()` se define en `20260702010000_add_email_and_phone_to_users.sql`, pero el comando `CREATE TRIGGER` para vincularla a la creación de filas en `auth.users` está ausente de las migraciones, rompiendo la automatización del perfil del usuario al registrarse.

*   **Bugs Críticos y Discrepancias de Esquema:**
    *   **Discrepancia de Nombres de Tablas (Migraciones vs. Código):**
        *   La migración `20260623203605_create_territorial_tables.sql` crea la tabla `satellite_analyses`. Sin embargo, la Edge Function `sync-single-parcel` y el frontend consultan la tabla `sat_telemetry`.
        *   La migración crea la tabla `agricultural_leads`, pero el código utiliza e inserta en `alerts_events`.
    *   **Inconsistencia en Tabla de Usuarios/Perfiles:** El script de sembrado `seed_carchi.js` inserta registros en la tabla `profiles` (Líneas 16, 19), mientras que el frontend (`AuthProvider.tsx:48`) y las migraciones manipulan la tabla `users`.
    *   **Ausencia Total de Tablas de Marketplace, Asociatividad y Agentes:** Las migraciones locales de Supabase no incluyen la creación de las tablas de Marketplace (`products_catalog`, `marketplace_listings`, `negotiations`, `market_prices`), Asociatividad (`associations`, `association_members`) ni de memoria de agentes (`agent_memory_state`, `provider_branches`), provocando errores de tabla no existente si la base de datos se despliega limpia.
    *   **Ausencia Total de RLS:** A pesar de que la arquitectura (`Backend_y_Datos.md`) exige Row Level Security para el aislamiento de productores y proveedores, **ninguna** de las migraciones activa RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) ni crea políticas de acceso.

---

### Componente C: Ecosistema de Agentes de IA (Python/FastAPI + LangGraph)
**Estado General:** Conceptualmente fuerte. Muestra una excelente implementación de orquestación de LangGraph, memoria serializada y validación espacial EUDR, pero presenta desacoplamientos de ejecución con el cliente y APIs de visión sin implementar.

*   **Funcionalidades Totalmente Operativas:**
    *   **Estructura LangGraph (`agro_agents_api/graph.py`):** Definición robusta de Supervisor y agentes especialistas (`meteorologist`, `irrigation_specialist`, etc.) utilizando ruteo inteligente basado en esquemas Pydantic (`Route`).
    *   **Memoria de Conversación (`agro_agents_api/main.py`):** El estado de la conversación se lee y se escribe de manera persistente en `agent_memory_state` mapeando el número de teléfono del usuario como `thread_id`.
    *   **Procesador de Cumplimiento EUDR (`agro_agents_api/eudr_processor.py`):** Implementa 5 reglas geométricas complejas (área, precisión de coordenadas, límites de bounding box, reparación topológica). Conecta con la API de Global Forest Watch (GFW) para verificar deforestación y provee un fallback geográfico local para zonas calientes de Ecuador. Genera y escribe el GeoJSON compatible con TRACES NT en la tabla `parcels`.

*   **Funcionalidades Parcialmente Operativas / Inoperativas / Faltantes:**
    *   **Visión del Fitopatólogo (`pest_specialist`):** El prompt del agente describe el análisis de imágenes/fotos de plagas, pero la estructura de datos del endpoint `/webhook/whatsapp` (`ChatRequest` en `main.py`) no admite archivos, URLs ni binarios de imagen, por lo que el agente es ciego a entradas visuales.
    *   **Persistencia de Leads B2B:** El endpoint `/api/batch_analyze_b2b` realiza el análisis e indica los matches de leads comerciales en el JSON de respuesta, pero no realiza escrituras de persistencia de estos leads en la base de datos (ej. en `b2b_smart_leads`).
    *   **Conmutación a Sentinel-1 (SAR):** Aunque `analyzer.py` está preparado conceptualmente para leer métricas SAR (VV/VH), los extractores reales (`sync-single-parcel/index.ts` y `run_cron.js`) solo consultan Sentinel-2 y no implementan la conmutación a microondas en caso de nubosidad mayor al 20%.
    *   **WhatsApp / n8n Webhook:** El flujo de n8n documentado en `.agents/workflows/` es de plantilla/simulado y el servidor de FastAPI no dispara webhooks reales hacia n8n ante alertas críticas de telemetría.
    *   **Bypass del Microservicio en Cliente:** Tanto el frontend (`agriExpertAI.ts`) como el cron programado (`run_cron.js`) realizan llamadas directas de API a Gemini desde el cliente en lugar de utilizar el microservicio de agentes de Python FastAPI, fragmentando la arquitectura.

---

## 2. Plan de Acción Priorizado

Para lograr que la plataforma AgroConecta alcance la operatividad total en producción, se propone la siguiente lista priorizada de acciones:

### Fase 1: Corrección de Base de Datos y Alineación de Esquemas (Bloqueo Crítico)
1.  **Sincronizar nombres de tablas en migraciones:** Crear una migración que renombre `satellite_analyses` a `sat_telemetry` y `agricultural_leads` a `alerts_events`, o bien alinear el código TypeScript/Python para consultar los nombres de las migraciones.
2.  **Agregar creación de tablas faltantes:** Escribir y desplegar archivos de migración SQL para crear las tablas de Marketplace (`products_catalog`, `marketplace_listings`, `negotiations`, `market_prices`), Asociaciones (`associations`, `association_members`) y memoria (`agent_memory_state`, `provider_branches`, `crop_recommendations`).
3.  **Unificar la tabla de usuarios:** Estandarizar la tabla a nivel de base de datos y de código (migrar todo a `users` y resolver la inconsistencia con `profiles` en `seed_carchi.js`).
4.  **Vincular el trigger de registro:** Escribir e incluir el comando `CREATE TRIGGER` en las migraciones para que `handle_new_user()` se ejecute al registrarse un usuario en `auth.users`.
5.  **Activar e implementar RLS:** Habilitar Row Level Security en todas las tablas clave y definir políticas basadas en el rol (`role`) del usuario para aislar la información de productores y proveedores.

### Fase 2: Corrección de Bugs en Frontend y Limpieza de Código (Alta Prioridad)
6.  **Corregir el bug de fechas del PDF:** Modificar `TraceabilityReport.tsx` para que lea `t.timestamp` en lugar de `t.created_at` (o actualizar la consulta SQL en `AgronomicHealth.tsx` para proyectar `created_at`).
7.  **Eliminar código huérfano:** Remover `ParcelManager.tsx` para limpiar la base de código y decidir si se elimina o se conecta la vista de `SmartLeads.tsx`.
8.  **Revisar especificación de `BranchManager`:** Ajustar la documentación de Obsidian o rediseñar el componente para que cumpla con el Módulo 8 (Dirección Regional/ONG), separándolo de la administración de sucursales de proveedores.

### Fase 3: Integración y Completitud del Ecosistema de IA (Media Prioridad)
9.  **Persistir Leads B2B:** Modificar el endpoint `/api/batch_analyze_b2b` para que inserte los leads validados por IA en la tabla `b2b_smart_leads`.
10. **Habilitar fotos para el Fitopatólogo:** Modificar la especificación de `ChatRequest` en `main.py` para aceptar una URL de imagen opcional y configurar LangGraph para consumir esta imagen en su análisis computacional.
11. **Implementar conmutación a Sentinel-1 (SAR):** Añadir soporte en los flujos de extracción satelital (`sync-single-parcel` y `run_cron.js`) para conmutar a la colección Sentinel-1 (CDSE) cuando la nubosidad de Sentinel-2 supere el 20%.
12. **Canalizar llamadas a través de FastAPI:** Modificar el frontend (`agriExpertAI.ts`) y el script del cron (`run_cron.js`) para que consuman las predicciones y diagnósticos agronómicos a través del endpoint del microservicio Python en lugar de hacer llamadas API directas a Gemini en el cliente.
13. **Completar Edge Function Territorial:** Descomentar e implementar la lógica de orquestación real en `supabase/functions/start-territorial-analysis/index.ts` para que los administradores realicen auditorías topológicas reales.
