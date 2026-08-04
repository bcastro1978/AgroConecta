# Módulo 1: Monitoreo Satelital (Copernicus)

## 📌 Resumen
Este módulo es el responsable de conectar las geometrías de las parcelas de los productores con la constelación de satélites Sentinel-2 de la Agencia Espacial Europea, con el fin de obtener imágenes multiespectrales y calcular índices de salud agronómica (NDVI, NDMI, BSI).

---

## 📖 Historias de Usuario

**HU-1.1: Sincronización de Telemetría**
> **Como** productor agrícola,
> **Quiero** poder sincronizar mi parcela con Sentinel Hub,
> **Para** obtener los índices actuales de salud (vigor, humedad, suelo) de mi cultivo sin tener que ir físicamente a la finca cada día.

**HU-1.2: Visualización de Imágenes Multiespectrales**
> **Como** ingeniero agrónomo,
> **Quiero** ver una renderización de la imagen satelital en color verdadero (RGB) y en mapa de calor (Raster),
> **Para** identificar visualmente en qué esquina específica de la parcela hay problemas de defoliación o estrés hídrico.

---

## ⚙️ Especificaciones Funcionales

1. **Obtención de Token OAuth:** El sistema debe autenticarse contra `identity.dataspace.copernicus.eu` utilizando `client_id` y `client_secret` cada vez que se ejecute una consulta.
2. **Transformación de Geometría (BBox):** El sistema debe recibir un polígono GeoJSON y transformarlo en un Bounding Box (caja delimitadora) añadiendo un padding de `0.0005` grados para asegurar captura de bordes.
3. **Cálculo de Intervalo (TimeRange):** Se deben evaluar los últimos 90 días con una tolerancia de cobertura de nubes (`maxCloudCoverage`) de hasta 100% como respaldo (o preferiblemente un umbral menor al 20% si hay cielos despejados).
4. **Cálculo Matemático de Índices:**
   - **NDVI** = (B08 - B04) / (B08 + B04) -> Vigor Vegetativo
   - **NDMI** = (B08 - B11) / (B08 + B11) -> Humedad de Planta
   - **BSI** = ((B11 + B04) - (B08 + B02)) / ((B11 + B04) + (B08 + B02)) -> Suelo Desnudo
5. **Generación Base64:** Las imágenes generadas a partir del evalscript deben ser convertidas de un `ArrayBuffer` a `base64` directamente en memoria para persistencia sin usar almacenamiento de archivos (buckets).

---

## 🛠️ Especificaciones Técnicas

- **Dependencias API:** Sentinel Hub API v1 (`/api/v1/statistics`, `/api/v1/process`).
- **Scripts de Evaluación:** Definidos en formato `//VERSION=3` de Sentinel Hub, manejando la banda `dataMask` para ignorar píxeles oscuros.
- **Base de Datos (Supabase):** 
  - Tabla destino: `sat_telemetry`.
  - Campos clave: `ndvi_avg` (float), `ndmi_avg` (float), `bsi_avg` (float), `image_base64` (text), `timestamp` (timestamptz).
- **Ejecución Asíncrona:** 
  - Vía CRON JOB (`run_cron.js` en Node.js).
  - Vía Sincronización Manual en cliente (`src/lib/copernicusSync.ts`).

---

## ⚠️ Consideraciones y Riesgos
- **Timeouts de API:** La API de Copernicus es susceptible a cuellos de botella (HTTP 504 o `UND_ERR_CONNECT_TIMEOUT`). Se requiere lógica de reintentos (*retries*).
- **Zonas Nubladas:** En la Amazonía o zonas tropicales de invierno, el filtro de 20% de nubes suele fallar, devolviendo arreglos vacíos. El sistema debe manejar gracefully el caso donde `statData.data.length === 0`.
