# Módulo 7: Mercado B2B (Proveedores y Compradores)

## 📌 Resumen
Esta es el área donde el ecosistema AgroConecta se monetiza. Los proveedores de insumos (Suppliers) y compradores de cosechas (Buyers) tienen interfaces dedicadas para descubrir oportunidades generadas por el Módulo de Leads de IA, contactar productores y gestionar transacciones o certificaciones (EUDR).

---

## 📖 Historias de Usuario

**HU-7.1: Visión Satelital Comercial**
> **Como** empresa de fertilizantes orgánicos (Supplier),
> **Quiero** ver un mapa nacional con zonas rojas de déficit nutricional,
> **Para** desplegar campañas de ventas geolocalizadas.

**HU-7.2: Adquisición Certificada**
> **Como** exportador europeo (Buyer),
> **Quiero** poder ver el inventario de parcelas de cacao que ya tienen el polígono EUDR verificado,
> **Para** firmar contratos de compra seguros que no sean multados en aduana.

---

## ⚙️ Especificaciones Funcionales

1. **Dashboard de Proveedores (`SupplierDashboard.tsx`):**
   - Panel de control de ventas.
   - Acceso al visor geográfico interactivo de leads (`B2BLeadsMap.tsx`).
   - Pipeline de CRM para seguimiento de ventas y contactos.
   - **Historias de Usuario Satelitales del Proveedor de Servicios:**
     - **HU-S1 (Mapa Inteligente de Demanda de Insumos):** Como proveedor de insumos, quiero consultar mapas de deficiencias por cantón para ofrecer fertilizantes dirigidos a asociaciones.
     - **HU-S2 (Rutas para Drones Spot Spraying):** Como empresa de drones, quiero exportar archivos de ruta GeoJSON con áreas de bajo NDVI para fumigación de precisión.
     - **HU-S3 (Seguro Agrícola Paramétrico):** Como aseguradora, quiero certificados inmutables de congelación (LST < 0°C) o sequías para indemnización rápida en 48h.
     - **HU-S4 (Muestreo Dirigido de Suelos):** Como laboratorio, quiero waypoints GPS de zonas expuestas (BSI) para tomar muestras de suelo dirigidas.
     - **HU-S5 (Planes de Mecanización):** Como proveedor de maquinaria, quiero índices de compactación para ofrecer servicios de arado y subsolado.
2. **Dashboard de Compradores y Mercado B2B (`MarketplaceBrowser.tsx`):**
   - **Compra Directa e Inventario en Tiempo Real:** Botón de alto contraste verde (`bg-[#1E3F20]`) para ejecutar la compra directa al precio base o de escala mayorista, descontando automáticamente las unidades adquiridas del inventario disponible en Supabase.
   - **Módulos de Feedback Visual y Notificaciones de Acción:** Modal de confirmación y feedback para cada transacción o envío de cotización.
   - **Sección Inferior de Historial de Transacciones y Cotizaciones:** Desglose completo de órdenes directas realizadas y cotizaciones enviadas, con el botón *"Ver Hilo de Respuestas"* para abrir el historial de conversación con el productor.
   - Herramienta de búsqueda para encontrar parcelas certificadas en sustentabilidad / WIPO GREEN.
   - Verificador visual de polígonos EUDR.
3. **Privacidad Comercial:**
   - La plataforma ofusca los nombres reales de los productores en el mapa interactivo hasta que el productor apruebe un "Request de Conexión".

4. **Catálogo Estructurado de Productos B2B (`products_catalog`):**
   - Catálogo base alimentado por Supabase y categorizado jerárquicamente para ser ofertado en `B2BListingForm.tsx`.
   - **Categorías y Tipos de Insumos/Servicios:**
     - **Fertilizantes y Nutrición Vegetal:** Edáficos (Urea 46%, DAP, KCl, NPK), Abonos Orgánicos (Compost, Humus, Biochar) y Foliares/Bioestimulantes.
     - **Protección de Cultivos:** Fungicidas (Preventivos, Sistémicos, Biológicos), Insecticidas, Herbicidas y Control Biológico (Feromonas).
     - **Semillas y Material Vegetativo:** Semillas certificadas (Maíz, Arroz), varetas e injertos (Cacao Fino de Aroma CCN-51) y plántulas (Café Sarchimor, Papa).
     - **Riego y Control Hídrico:** Mangueras de goteo, goteros, bombas de agua diésel y filtros de anillos.
     - **Maquinaria y Herramientas:** Fumigadoras de espalda, herramientas de poda y servicio de alquiler de tractores.
     - **Servicios Agronómicos y Tecnología:** Aspersión con dron agrícola, mapeo multiespectral NDVI, análisis de suelos/foliares y consultoría de certificación EUDR.

---

## 🛠️ Especificaciones Técnicas

- **Integración de Mapas:** El `B2BLeadsMap` utiliza `react-leaflet` alimentado por consultas de agregación geoespacial de Supabase/PostGIS.
- **Flujo de Contacto:** Alertas in-app y triggers de correos electrónicos (y potencialmente WhatsApp vía webhook de Meta).
- **Tablas:** `products_catalog`, `marketplace_listings`, `b2b_leads`, `quotes`.

---

## ⚠️ Consideraciones y Riesgos
- **Latencia Geoespacial:** Cargar cientos de miles de puntos de leads en un visor web map puede hacer lenta la plataforma. Se recomienda implementar "Clustering" (agrupación de pines) en Leaflet a nivel de frontend.
