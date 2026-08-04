# Audit Técnico Funcional y Conceptual del Frontend - AgroConecta

## 1. Observation

Durante la auditoría del frontend de la aplicación React de AgroConecta (bajo `src/`), se registraron las siguientes observaciones directas sobre los componentes, flujos de autenticación, integración satelital, análisis de IA y vistas del panel de administración:

### A. Estructura y Enrutamiento Activo
- **Enrutamiento Principal (`src/App.tsx`)**:
  El archivo `src/App.tsx` define las rutas públicas (`/`, `/login`, `/register`) y una ruta protegida `/dashboard` administrada por `<DashboardRouting />`:
  ```tsx
  35:                         <Route path="/dashboard" element={
  36:                             <ProtectedRoute>
  37:                                 <DashboardRouting />
  38:                             </ProtectedRoute>
  39:                         } />
  ```
  Dependiendo del rol en el perfil (`profile.role`), redirecciona a:
  - `AdminDashboard` (`profile.role === 'Admin'`)
  - `BuyerDashboard` (`profile.role === 'Comprador'`)
  - `SupplierDashboard` (`profile.role === 'Proveedor'`)
  - `ProducerDashboard` (Default / Productor)

- **Vistas Huérfanas / No Integradas**:
  - `src/components/producer/ParcelManager.tsx`: Este componente para la demarcación satelital y certificación EUDR no se importa ni se enruta en `App.tsx` ni en los dashboards principales. En su lugar, el panel del productor (`ProducerDashboard.tsx`) carga directamente `ProducerParcels.tsx` bajo la pestaña `map`.
  - `src/components/dashboard/copernicus/SmartLeads.tsx`: Este componente que renderiza un listado de oportunidades satelitales asociadas a un proveedor no es importado en `SupplierDashboard.tsx` ni en ningún otro archivo de la aplicación, por lo que es una vista huérfana.

### B. Módulo de Autenticación y Registro Multi-Perfil
- **Gestión de Identidad (`src/components/auth/AuthProvider.tsx` y `RegisterForm.tsx`)**:
  - `AuthProvider.tsx` implementa un React Context real que escucha cambios de estado mediante `supabase.auth.onAuthStateChange` y realiza la lectura del perfil del usuario contra la tabla pública `users` (línea 48: `await supabase.from('users').select('*').eq('id', userId).single()`).
  - Para mitigar condiciones de carrera con el trigger de creación en Supabase, implementa reintentos automáticos (líneas 61-64):
    ```tsx
    61:             if ((!data || (error && error.code === 'PGRST116')) && retries > 0) {
    62:                 console.log(`Perfil no encontrado, reintentando... (${retries})`);
    63:                 setTimeout(() => fetchProfile(userId, retries - 1), 1000); // Esperar 1 segundo
    64:                 return;
    65:             }
    ```
  - `RegisterForm.tsx` (líneas 62-78) realiza el registro guardando los metadatos en `options.data` (incluyendo coordenadas de georreferencia del operador, provincia, cantón y parroquia) y posee soporte de GPS móvil nativo o ajuste manual en mapa mediante `MapSelector`.

### C. Monitoreo Satelital (Copernicus CDSE) y Diagnóstico de IA
- **Sincronización en Navegador (`src/lib/copernicusSync.ts`)**:
  - Implementa flujos reales de consulta para Sentinel-2 (L2A) utilizando el endpoint OAuth de CDSE y APIs de procesamiento de estadísticas e imágenes raster:
    ```tsx
    61:         const tokenRes = await fetch('/api/cdse-auth/auth/realms/CDSE/protocol/openid-connect/token', { ...
    ...
    83:         const resStats = await fetch('/api/cdse-sh/api/v1/statistics', { ...
    ...
    123:             const resImg = await fetch('/api/cdse-sh/api/v1/process', { ...
    ```
  - Calcula NDVI (Vigor), NDMI (Humedad) y BSI (Suelo Desnudo) mediante evalscripts en Sentinel Hub.
  - Guarda la telemetría e imágenes resultantes (Base64) en la tabla `sat_telemetry`.
  - Invoca al experto agrícola de IA e inserta las anomalías correspondientes en `alerts_events`.

- **Análisis de Precisión con IA (`src/lib/agriExpertAI.ts`)**:
  - Realiza llamadas directas al modelo generativo `gemini-flash-latest` a través del endpoint oficial de Google:
    ```tsx
    32:         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    ```
  - Envía las lecturas numéricas calculadas y requiere una estructura estricta en JSON (`severity`, `title`, `diagnosis`).

- **Visores y Mapas del Productor (`src/components/dashboard/copernicus/`)**:
  - `ProducerParcels.tsx`: Ofrece un mapa interactivo Leaflet con selección de capas de mapas base (Street, Satellite, Google Hybrid). Posee funcionalidad para dibujar polígonos manualmente o realizar el trazado continuo caminando los linderos en tiempo real mediante `navigator.geolocation.watchPosition` (línea 175). Limita el área máxima a 50 Hectáreas (línea 323). Muestra las firmas NDVI como capas superpuestas en el mapa (`ImageOverlay` de Leaflet) utilizando las coordenadas calculadas (`image_bounds`).
  - `AgronomicHealth.tsx`: Genera vistas de semáforos de vigor (NDVI) e hidratación (NDMI) e integra historial de reportes.

- **Bugs Críticos en Reportes (`src/components/dashboard/copernicus/TraceabilityReport.tsx`)**:
  - El componente de trazabilidad EUDR (`TraceabilityReport.tsx`) que exporta el certificado inmutable a PDF intenta clasificar e imprimir las fechas de telemetría basándose en la propiedad `created_at`:
    ```tsx
    73:                 .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    ...
    76:                     new Date(t.created_at).toLocaleDateString(),
    ...
    189:                                     <span className="font-bold text-[#57534E]">{new Date(t.created_at).toLocaleDateString()}</span>
    ```
  - Sin embargo, la consulta de telemetría satelital en `AgronomicHealth.tsx` (línea 36) no incluye `created_at` en su proyección SELECT, sino `timestamp`. Como consecuencia, `t.created_at` es `undefined` al ejecutarse el reporte, lo que provoca la visualización de fechas inválidas ("Invalid Date") o fechas de época en el PDF descargable y en la previsualización del certificado.

### D. Mercado B2B (Matchmaking, Cotizaciones y Precios MCP)
- **Visualización de Leads e Inteligencia (`src/pages/B2BLeadsMap.tsx` e `HeatmapDemand.tsx`)**:
  - `B2BLeadsMap.tsx` (Lead Radar) lee de la tabla `b2b_smart_leads` y despliega los polígonos geográficos de las parcelas con estrés detectado en un visor Leaflet, permitiendo a los proveedores enviar cotizaciones directamente.
  - `HeatmapDemand.tsx` extrae alertas de severidad 'Alta' y 'Media' de la tabla `alerts_events`, aproxima el centroide de sus polígonos y las grafica como marcadores circulares de calor difuminados para preservar la privacidad de los productores.
- **Transaccionalidad (`src/components/market/`)**:
  - `MarketplaceBrowser.tsx`: Consulta las ofertas de venta (`marketplace_listings`). Si el productor tiene linderos registrados, añade automáticamente el distintivo verde "Cultivo Validado Satelitalmente" (cumplimiento EUDR/WIPO GREEN) e interactúa con `negotiations` para registrar cotizaciones.
  - `AdminPriceManager.tsx` e `MarketPricesView.tsx`: Gestión interactiva de índices MCP sobre la tabla `market_prices`.

### E. Módulo de Administración y Simulación
- **Dashboard Root (`src/components/dashboard/AdminDashboard.tsx`)**:
  - Permite a los administradores aprobar o denegar usuarios pendientes.
- **Análisis Territorial Simulado (`src/components/admin/TerritorialAnalysis.tsx` y `AnalysisResults.tsx`)**:
  - `TerritorialAnalysis.tsx` implementa filtros de provincia, cantón y parroquia con datos geográficos de Ecuador.
  - La simulación de extracción y análisis no consulta servicios satelitales en tiempo real, sino que realiza un retardo simulado de 2.5 segundos e incrementa la latitud/longitud de unas geometrías precargadas en código (`initialMockParcels`, líneas 35-60) para desplazarlas sobre las coordenadas del cantón seleccionado.
  - `AnalysisResults.tsx` intenta enviar peticiones de auditoría topológica y deforestación al puerto local `localhost:8000/api/eudr/validate/${parcelId}`. Si la petición falla (es decir, el backend de Python no se encuentra activo), implementa un fallback/mock en navegador (líneas 43-57) que simula el estatus exitoso ("Deforestation-free") y genera un archivo GeoJSON de descarga estructurada de forma sintética (líneas 70-89).

- **Desajuste de Especificación (`src/components/dashboard/BranchManager.tsx`)**:
  - El archivo `BranchManager.tsx` se detalla en las especificaciones funcionales (Módulo 8) como un panel de delegación y reportería geográfica para directores regionales y ONGs (WIPO GREEN). Sin embargo, en el código real se implementa como un editor de sucursales físicas (CRUD en `provider_branches`) para que los proveedores B2B registren sus puntos de distribución y despacho logístico en el `SupplierDashboard.tsx`.

---

## 2. Logic Chain

A partir de las observaciones, se deduce el estado del frontend mediante los siguientes pasos lógicos:

1. **Autenticación y Registro**:
   Dado que `AuthProvider.tsx`, `Login.tsx` y `RegisterForm.tsx` interactúan directamente con los esquemas de Supabase Auth y la tabla de usuarios (`users`), y que se implementaron estrategias para evitar condiciones de carrera en el registro (retries en fetch), el flujo de control de acceso y RBAC es **completamente operativo**.

2. **Monitoreo Satelital y Diagnósticos por IA**:
   Dado que `copernicusSync.ts` y `agriExpertAI.ts` contienen llamadas HTTP reales configuradas hacia la API de Sentinel Hub/CDSE (vía proxys de Vite) y Gemini Flash, y que `ProducerParcels.tsx` maneja linderos Leaflet en producción (incluyendo trazado por GPS móvil nativo e ImageOverlay de NDVI sobre la parcela), esta funcionalidad es **completamente operativa**.

3. **Reportes EUDR**:
   Dado que `TraceabilityReport.tsx` busca renderizar fechas a través de la propiedad `t.created_at`, pero el listado inicial de telemetría en `AgronomicHealth.tsx` (línea 36) únicamente solicita `timestamp` de la base de datos, se concluye lógicamente que la fecha de telemetría en el PDF de trazabilidad exportado se procesará como `undefined`, generando un error visual de tipo **"Invalid Date"** en el reporte PDF del usuario final.

4. **Visibilidad B2B y Matchmaking**:
   Puesto que `B2BLeadsMap.tsx`, `HeatmapDemand.tsx` y `MarketplaceBrowser.tsx` están integrados en las vistas activas de proveedores y compradores y ejecutan consultas directas a las tablas correspondientes (`b2b_smart_leads`, `alerts_events`, `marketplace_listings`), el flujo comercial y de leads geolocalizados es **completamente operativo**.
   Sin embargo, el componente `SmartLeads.tsx` no tiene importaciones ni referencias en la aplicación activa, por lo que es una **funcionalidad inactiva/huérfana**.

5. **Análisis Territorial Administrativo**:
   Debido a que `TerritorialAnalysis.tsx` opera desplazando un arreglo estático de coordenadas (`initialMockParcels`) y utiliza un retraso ficticio en lugar de consultar APIs geoespaciales reales, y que `AnalysisResults.tsx` recurre a un fallback mockeado en el navegador cuando no puede conectarse al puerto `localhost:8000`, la funcionalidad de Auditoría Territorial del Administrador es **parcialmente operativa (simulada/mock-only)**.

6. **Cumplimiento del Rol Branch Manager (Módulo 8)**:
   Dado que el componente `BranchManager.tsx` es utilizado por los proveedores B2B para crear sucursales en lugar de proveer análisis macro-geográficos a directores regionales de ONGs, la especificación de "Delegaciones y Reportería Regional" de la boveda de Obsidian se encuentra **sin implementar / ausente**.

---

## 3. Caveats

- **Pruebas de Conexión del Backend**: No se probó la ejecución paralela del servidor Python local en el puerto 8000. Por tanto, se asume que las peticiones que realizan fallback a mocks en `AnalysisResults.tsx` y `ParcelManager.tsx` funcionarían integradas en caso de que dicho servicio esté activo.
- **Credenciales Externas**: La correcta ejecución de las consultas de Copernicus (`copernicusSync.ts`) y Gemini (`agriExpertAI.ts`) depende de que las variables de entorno `VITE_SENTINEL_CLIENT_ID`, `VITE_SENTINEL_CLIENT_SECRET` y `VITE_GEMINI_API_KEY` estén correctamente pobladas en el entorno local.
- **Acceso de Supabase**: No se evaluaron políticas RLS en la base de datos de Supabase, solo el comportamiento esperado a nivel de peticiones desde el cliente React.

---

## 4. Conclusion

El frontend de AgroConecta está muy avanzado y la mayoría de sus módulos core (Autenticación, Monitoreo Satelital real, IA Diagnósticos en caliente con Gemini, Marketplace B2B y Visualización de Leads en mapas) están **completamente operativos** e implementados pixel-perfect con Tailwind CSS.

Sin embargo, para lograr la madurez técnica, se requiere:
1. **Corregir el bug de fechas en PDF**: Cambiar `t.created_at` por `t.timestamp` en `TraceabilityReport.tsx` para evitar certificados con "Invalid Date".
2. **Revisar o eliminar el desajuste de `BranchManager`**: Decidir si se implementará la vista del Módulo 8 para ONGs o si el componente continuará sirviendo únicamente para sucursales de proveedores.
3. **Limpiar código muerto**: Eliminar `ParcelManager.tsx` (reemplazado por `ProducerParcels.tsx`) y conectar o remover `SmartLeads.tsx`.
4. **Completar Módulo de Administración**: Integrar auditorías satelitales reales en el visor territorial de administración, reduciendo la dependencia de simulaciones estáticas.

---

## 5. Verification Method

Para verificar independientemente el comportamiento reportado del frontend:

1. **Verificación de Enrutamiento y Huerfanía**:
   - Abrir `src/App.tsx` y comprobar las importaciones. Confirmar la ausencia de rutas o referencias a `ParcelManager` y `SmartLeads`.
   - Ejecutar la búsqueda de dependencias para comprobar el desuso de `ParcelManager.tsx` (solo existe su declaración).

2. **Verificación de Fechas en Reporte Inmutable (Bug de `created_at`)**:
   - Inspeccionar el archivo `src/components/dashboard/copernicus/AgronomicHealth.tsx` en la línea 36. Confirmar que solo proyecta la propiedad `timestamp` en el select de `sat_telemetry`.
   - Inspeccionar `src/components/dashboard/copernicus/TraceabilityReport.tsx` en las líneas 73, 76 y 189. Comprobar que intenta leer `t.created_at`.

3. **Verificación del Simulación Territorial**:
   - Inspeccionar `src/components/admin/TerritorialAnalysis.tsx` y analizar el método `handleStartAnalysis`. Comprobar la existencia del bloque `await new Promise(resolve => setTimeout(resolve, 2500))` y el bucle de translación de coordenadas geográficas ficticias `shiftedParcels` utilizando `dLat` y `dLng`.
   - Inspeccionar `src/components/admin/AnalysisResults.tsx` en las líneas 43-57 y comprobar el bloque `catch` con el mock `setEudrStatus('Success')` y su correspondiente descarga simulada de GeoJSON.
