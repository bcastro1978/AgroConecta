# Módulo 6: Dashboard del Productor (Core Agrícola)

## 📌 Resumen
El corazón operativo de la plataforma para los agricultores. Aquí es donde los productores gestionan su patrimonio físico (parcelas) y monitorean sus cultivos. Es el punto de entrada para conectar con los módulos de Inteligencia Artificial y Monitoreo Satelital.

---

## 📖 Historias de Usuario

**HU-6.1: Gestión de Parcelas**
> **Como** productor agrícola,
> **Quiero** poder añadir múltiples fincas a mi perfil con su nombre, tamaño y tipo de cultivo,
> **Para** llevar un control individualizado de mis diferentes tierras.

**HU-6.2: Resumen Holístico de Salud**
> **Como** gerente agrícola,
> **Quiero** ver un listado rápido del estado general de todas mis parcelas en una sola pantalla,
> **Para** priorizar qué finca debo visitar en la semana.

---

## ⚙️ Especificaciones Funcionales

1. **Listado de Parcelas:** Renderizado dinámico de las fincas asociadas al `user_id` (o `producer_id`) del usuario logueado.
2. **Integración con Copernicus:** Cada tarjeta de parcela debe tener un botón para abrir el sub-panel de "Salud Agronómica" (`AgronomicHealth.tsx`), donde se invoca al Módulo 1 (Satelital) y Módulo 2 (IA).
3. **Registro de Cultivos:** Capacidad de definir el tipo de cultivo (`active_crop`), lo que altera la lógica de los prompts de la IA posteriormente.
4. **Exportación EUDR:** Acceso directo al Módulo 3 de Trazabilidad desde cada finca.
5. **Índice de Mercado SIPA & MAG (MARKET INDEX):** Visualización integral de precios agrícolas provistos exclusivamente por datos reales almacenados en la base de datos Supabase (`market_prices`) o mediante consulta directa al portal oficial del Ministerio de Agricultura y Ganadería de Ecuador (MAG - SIPA):
   - **Política Estricta Cero Datos Simulados / Mock:** Se eliminó cualquier array o dato estático simulado. La plataforma muestra únicamente registros reales almacenados en la base de datos o el portal gubernamental en vivo.
   - **Tablero Dinámico Oficial MAG:** Integración directa mediante iframe modal del Tablero Oficial de Precios a Productor MAG SIPA (`https://servicios.mag.gob.ec/tableros/P_P/TBL_PP`).
   - **Historias de Usuario Satelitales del Productor:**
     - **HU-P1 (Fertilización Dosis Variable):** Como productor, quiero visualizar mapas de nitrógeno (NDRE/CCC) para aplicar dosis exactas y ahorrar 25% en insumos.
     - **HU-P2 (Balance Hídrico y Riego):** Como productor, quiero alertas en mm/día (ETa/NDMI) para evitar el aborto de flor en cafetales y cacaotales.
     - **HU-P3 (Epidemiología Preventiva):** Como productor, quiero notificaciones de riesgo fito-sanitario (LST + Radar) para aplicar fungicidas 5 a 7 días antes de síntomas visibles.
     - **HU-P4 (Predicción de Cosecha B2B):** Como productor, quiero estimaciones de rendimiento (FAPAR) para comercializar la cosecha por anticipado.
     - **HU-P5 (Expediente Trazabilidad EUDR):** Como exportador, quiero descargar el expediente completo de 3 documentos (DDS, GeoJSON TRACES, RUA MAG) para exportar a la UE.
   - **Portal de Precios Referenciales:** Acceso directo a las fuentes oficiales publicadas en el portal SIPA (`https://sipa.agricultura.gob.ec/index.php/precios-referenciales`).
6. **Catálogo Automatizado por Perfil:** El formulario de ofertas B2B (`B2BListingForm.tsx`) detecta de forma automática el rol del usuario activo (`profile.role`):
   - **Productor:** Carga exclusivamente los productos de cosecha agrícola (Cacao, Arroz, Papa, Maíz, Plátano, Tomate, Café, etc.).
   - **Proveedor:** Carga exclusivamente los insumos, semillas, agroquímicos, maquinaria y servicios técnicos.
7. **Selección de Cultivo en Geometría Satelital:** En la pestaña **MAPA CDSE** (`ProducerParcels.tsx`), el campo *"Identificador del Cultivo"* fue reemplazado por la selección directa del **Catálogo de Productos Agrícolas del Productor** (`products_catalog`), asegurando consistencia entre la finca georreferenciada y el catálogo de la plataforma.
8. **Validación Satelital Obligatoria para Publicar Ofertas:** Para publicar una oferta B2B en `B2BListingForm.tsx`, el sistema valida que el producto seleccionado coincida con un cultivo registrado en las parcelas satelitales del productor (`parcels`). Si el cultivo no cuenta con mapa geoespacial en su perfil, la publicación se inhabilita con una alerta que guía al agricultor a mapearlo en la pestaña **MAPA CDSE**.
9. **Dashboard Analítico Agroproductivo Nacional (`NationalMarketAnalytics.tsx`):**
   - **Registro Desagregado por Provincia:** Almacenamiento en `market_prices` de las cotizaciones a nivel de productor (Pie de Finca) para 31+ registros en provincias estratégicas (Guayas, Los Ríos, Manabí, Pichincha, Carchi, Tungurahua, Azuay, Loja, El Oro, Santo Domingo, etc.).
   - **Métricas e Índices Nacionales:** Cálculo dinámico de Precios Promedio Nacionales, Provincias con Máxima y Mínima cotización en finca, e índice de margen de intermediación (Finca vs. Mercado Mayorista).
   - **Tableau oficial MAG TBL_PP:** Modal e integración en vivo con la plataforma de inteligencia agropecuaria del MAG Ecuador (`https://servicios.mag.gob.ec/tableros/P_P/TBL_PP`).

---

## 🛠️ Especificaciones Técnicas

- **Componente Principal:** `src/components/dashboard/ProducerDashboard.tsx`
- **Componente del Índice de Mercado:** `src/components/market/MarketPricesView.tsx`
- **Servicio de Datos SIPA:** `src/lib/sipaPricesService.ts`
- **Tablas Involucradas:** 
  - `parcels`: `id`, `producer_id`, `name`, `active_crop`, `geometry`, `total_area`.
  - `market_prices`: `id`, `product_id`, `price`, `market_name`, `date`.
  - `products_catalog`: `id`, `name`, `unit`, `category`.
- **Relaciones de Datos:**
  Una Parcela (`parcels`) tiene relación de *Uno a Muchos (1:N)* con `sat_telemetry` y con `alerts_events`.

---

## ⚠️ Consideraciones y Riesgos
- **Escalabilidad UI:** Si un productor tiene 50 parcelas, renderizar todas con un componente pesado de gráficos puede colapsar el rendimiento de React. Se debe implementar paginación o carga diferida (Lazy Loading).
- **Disponibilidad de Datos:** En caso de fallas en la conexión a Supabase o falta de registros actuales, `MarketPricesView.tsx` conmuta de forma transparente al proveedor en vivo/referencial de datos SIPA (`sipaPricesService.ts`).
