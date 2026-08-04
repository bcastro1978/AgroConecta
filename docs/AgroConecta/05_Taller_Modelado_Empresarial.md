# Módulo 9 / Taller: Modelado Empresarial (TOGAF / ArchiMate)
**Cadenas de Valor, Flujos de Valor y Mapa de Capacidades de Negocio para AgroConecta**

---

## 📌 Resumen
Documento arquitectónico generado para el Taller de Desarrollo de Productos y Servicios (UTPL / Prendho), alineando los módulos funcionales y técnicos de la plataforma AgroConecta bajo el estándar TOGAF / ArchiMate.

---

## 🏗️ 1. Cadena de Valor (Porter)
- **Actividades Primarias**:
  - Logística de Entrada: Registro multi-perfil, georreferenciación GeoJSON de parcelas.
  - Operaciones: Monitoreo satelital (Copernicus Sentinel-2/1 SAR), diagnóstico de IA fitosanitaria.
  - Logística de Salida: Certificación EUDR (TRACES NT), publicación en Marketplace.
  - Marketing y Ventas: Smart Leads B2B georeferenciados, catálogo categorizado por insumos.
  - Servicio: Asistente agronómico de IA vía WhatsApp/Web, soporte por gerencias regionales.
- **Actividades de Soporte**:
  - Infraestructura (Supabase Auth/PostGIS, Vercel), Recursos Humanos (Agrónomos, Branch Managers), Tecnología (Copernicus, Gemini, LangGraph, Leaflet), Adquisiciones (Proveedores B2B, Certificadoras).

---

## 🌊 2. Flujos y Etapas de Valor

### Flujos Centrales (De cara al cliente)
1. **FC-01: Certificación EUDR Cero Deforestación**:
   - *Desencadenante*: Solicitud de validación de lote de exportación a la UE.
   - *Etapas*: Delimitación GeoJSON $\rightarrow$ Cruce de Capas Pre-2020 $\rightarrow$ Análisis IA $\rightarrow$ Dictamen TRACES NT.
   - *Resultado*: GeoJSON validado sin deforestación post-2020.
2. **FC-02: Conexión Comercial B2B (Smart Leads)**:
   - *Desencadenante*: Detección satelital de anomalía/estrés fitosanitario en parcela.
   - *Etapas*: Detección de anomalía $\rightarrow$ Recomendación de insumo $\rightarrow$ Notificación a proveedor verificado cercano $\rightarrow$ Cotización.
   - *Resultado*: Venta e insumo oportuno para salvar la cosecha.

### Flujos de Soporte (Operatividad interna)
1. **FS-01: Telemetría Anti-Nubes SAR (Sentinel 2/1)**:
   - *Desencadenante*: Cronjob batch de actualización espectral.
   - *Etapas*: Descarga Sentinel-2 $\rightarrow$ Evaluación de nubes (>20%) $\rightarrow$ Conmutación a Radar SAR Sentinel-1 $\rightarrow$ Matriz PostGIS.
   - *Resultado*: Serie temporal NDVI/NDMI continua.
2. **FS-02: Verificación Administrativa y RBAC**:
   - *Desencadenante*: Registro de nuevo proveedor B2B.
   - *Etapas*: Formulario de registro $\rightarrow$ Verificación admin $\rightarrow$ Asignación de rol `Verified` $\rightarrow$ Habilitación de catálogo.
   - *Resultado*: Acceso a publicación en Marketplace B2B.

---

## 🗺️ 3. Mapa de Capacidades por Niveles

- **1. Monitoreo Satelital y Teledetección**
  - 1.1 Adquisición de Datos Satelitales (N2) $\rightarrow$ Ingesta Sentinel-2 (N3), Ingesta SAR Sentinel-1 (N3).
  - 1.2 Procesamiento Fitosanitario (N2) $\rightarrow$ Cálculo NDVI/NDMI (N3), Conmutación Anti-Nubes (N3).
- **2. Trazabilidad EUDR y Certificación**
  - 2.1 Captura Geoespacial Poligonal (N2) $\rightarrow$ Dibujo GeoJSON (N3), Validación PostGIS (N3).
  - 2.2 Análisis Deforestación (N2) $\rightarrow$ Cruce Histórico (N3), Dictamen TRACES NT (N3).
- **3. Mercado B2B & Smart Leads**
  - 3.1 Gestión de Catálogo B2B (N2) $\rightarrow$ Categorización por Insumos/Servicios (N3), Precios por Volumen (N3).
  - 3.2 Generación de Smart Leads (N2) $\rightarrow$ Matchmaking Alertas-Ofertas (N3), Georreferenciación de Leads (N3).
- **4. Asistencia Agronómica IA (Multi-Agente)**
  - 4.1 Diagnóstico Agronómico (N2) $\rightarrow$ Agente Fitosanitario (N3), Agente Riego/Suelo (N3).

---

## 📋 4. Componentes Operativos (4 Pilares)
- **Personas**: Productor, Proveedor B2B, Comprador, Gerente Regional, Agente IA.
- **Información**: GeoJSON, Índices NDVI/NDMI, Catálogo de Productos (`products_catalog`), `marketplace_listings`, `b2b_leads`.
- **Procesos**: Conmutación Anti-Nubes, Certificación EUDR, Matchmaking B2B, Autenticación RLS.
- **Recursos**: API Copernicus CDSE, Supabase Postgres/PostGIS, Gemini 1.5 Pro, Leaflet, Drones.

---

## 🚀 5. Oportunidades de Mejora (OM)
1. **OM-01**: Conmutación automática en tiempo real a Radar SAR Sentinel-1 cuando la nubosidad supere el 20%.
2. **OM-02**: Engine de matchmaking predictivo en tiempo real entre anomalías agronómicas y catálogo de proveedores locales.
3. **OM-03**: Conexión vía API/Webhook directo con la plataforma oficial TRACES NT de la Unión Europea.
