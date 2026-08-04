# Módulo 3: Trazabilidad (EUDR)

## 📌 Resumen
El objetivo principal de este módulo es garantizar la capacidad del productor para exportar su producto agrícola a la Unión Europea. El EUDR (European Union Deforestation Regulation) obliga a todos los exportadores de cacao, café, entre otros, a proporcionar coordenadas de geolocalización (polígonos) precisos que certifiquen que la producción no proviene de tierras deforestadas después del 31 de diciembre de 2020.

---

## 📖 Historias de Usuario

**HU-3.1: Definición de Geometría EUDR**
> **Como** exportador / productor agrícola,
> **Quiero** dibujar el polígono exacto de mi finca en un mapa digital,
> **Para** obtener un certificado EUDR que pueda entregar a mi comprador europeo y evitar sanciones aduaneras.

**HU-3.2: Generación del Reporte PDF Trazable**
> **Como** auditor comercial B2B,
> **Quiero** poder descargar el mapa y la trazabilidad de cada parcela registrada,
> **Para** auditar la cadena de suministro verde (WIPO GREEN) y certificar las compras.

---

## ⚙️ Especificaciones Funcionales

1. **Gestor de Polígonos (Map Draw):** La plataforma debe integrar una herramienta de mapeo interactivo (Leaflet-Draw) que permita al productor delimitar los bordes de la parcela.
2. **Registro de Propiedad (GeoJSON):** Una vez que se dibuja el polígono, este debe ser convertido a formato GeoJSON (estándar abierto internacional para datos espaciales) y guardado en la base de datos junto con el área en hectáreas.
3. **Análisis de No-Deforestación (Reglamento UE 2023/1115):** La plataforma contrasta el polígono GeoJSON con 3 fuentes satelitales oficiales:
   - **Copernicus Sentinel-2 (Óptico 10m):** Comparación de series temporales de firmas espectrales `NDVI` (Biomasa) entre la fecha de corte obligatoria (**31 de Diciembre de 2020**) y la fecha actual.
   - **Copernicus Sentinel-1 SAR (Radar Banda C):** Retrodispersión de radar (`VV/VH`) para penetrar nubosidad tropical y validar la estructura tridimensional del dosel forestal.
   - **Capas Base de Bosque 2020 (ESA WorldCover / Global Forest Watch):** Intersección espacial contra la capa oficial de cobertura forestal existente a diciembre de 2020.
4. **Formatos Oficiales de Presentación Exigidos por la UE:**
   - **Geolocalización Digital (TRACES NT System):** Archivo `GeoJSON` normalizado en sistema `WGS84` (EPSG:4326) con coordenadas de polígono cerrado (6 decimales de precisión) para parcelas ≥4 ha.
   - **Declaración de Debida Diligencia (DDS PDF):** Documento impreso/digital de la Declaración de Debida Diligencia con `ID_CERT` criptográfico e historial multiespectral del lote.
5. **Formatos Oficiales Exactos Aplicados en `TraceabilityReport.tsx`:**
   - **DOC 1 (DDS PDF Anexo II UE):** Formato con número EORI, Código Arancelario HS (1801.00 Cacao / 0901.11 Café), Masa Neta en Tm, Rango de cosecha y Declaración Jurada Literal del Anexo II Punto 7 del Reglamento (UE) 2023/1115.
   - **DOC 2 (GeoJSON TRACES NT):** Esquema oficial `$schema` para la API de TRACES NT en WGS84 EPSG:4326 con propiedades arancelarias y polígono de 6 decimales.
   - **DOC 3 (RUA MAG Ecuador PDF):** Certificado oficial del Registro Único Agrícola (RUA) del Ministerio de Agricultura y Ganadería del Ecuador para cumplimiento del Art. 3(b) de legalidad nacional.

---

## 🛠️ Especificaciones Técnicas

- **Librerías Frontend:** `react-leaflet`, `leaflet`, `jspdf`, `jspdf-autotable`.
- **Tipo de Dato (Supabase/PostgreSQL):** La columna `geometry` en la tabla `parcels` se almacena nativamente como formato JSONB.
- **Lógica Bounding Box:** El código extrae el Bounding Box del polígono iterando sobre sus latitudes máximas y mínimas, y este BBox es el que se inyecta posteriormente al módulo Sentinel-2 para capturar la imagen precisa y no el país entero.

---

## ⚠️ Consideraciones y Riesgos
- **Complejidad de Polígonos:** Si el agricultor dibuja un polígono que se interseca sobre sí mismo (Self-Intersecting Polygon), algunas bases de datos geoespaciales o el API de Copernicus podrían rechazarlo con errores geométricos.
- **Precisión GPS Móvil:** Si el agricultor usa el móvil estando en el campo, el GPS puede desviar los puntos varios metros. Se debe permitir al usuario ajustar finamente (Drag & Drop de vértices).
