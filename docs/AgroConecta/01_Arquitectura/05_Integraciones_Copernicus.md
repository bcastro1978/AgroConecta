# Integraciones Copernicus y Matriz de Indicadores Satelitales (CDSE)

## 📌 Resumen
El programa Copernicus Data Space Ecosystem (CDSE) de la Agencia Espacial Europea (ESA) permite a AgroConecta extraer series temporales multiespectrales y radar para transformar píxeles satelitales en decisiones de agricultura de precisión y certificaciones de trazabilidad ambiental (EUDR).

---

## 🛰️ Matriz Completa de Indicadores Extraíbles vía CDSE

### 1. Salud Foliar, Nitrógeno y Fotosíntesis (Sentinel-2 Óptico 10m)
- **NDVI (Normalized Difference Vegetation Index):** Vigor vegetativo y biomasa foliar viva.
- **NDRE (Normalized Difference Red Edge):** Estrés nutricional de nitrógeno temprano en banda Red Edge (B05).
- **CCC (Canopy Chlorophyll Content):** Contenido total de clorofila foliar para fertilización de precisión.
- **EVI (Enhanced Vegetation Index):** Vigor vegetativo corregido para doseles densos (Cacao/Café).
- **LAI (Leaf Area Index):** Índice de área foliar por metro cuadrado.
- **FCOVER (Fraction of Vegetation Cover):** Fracción de cobertura vegetal para cálculo de sombra.

### 2. Estrés Hídrico y Suelo (Sentinel-2 & Sentinel-1 SAR)
- **NDMI (Normalized Difference Moisture Index):** Estrés hídrico foliar en copa de árboles.
- **SSM (Surface Soil Moisture - Sentinel-1):** Humedad superficial del suelo por radar de microondas.
- **BSI (Bare Soil Index):** Índice de suelo desnudo para degradación y erosión.

### 3. Temperatura y Microclima (Sentinel-3 SLSTR & ERA5)
- **LST (Land Surface Temperature):** Temperatura real de la superficie del suelo y copa foliar (detección de heladas en la Sierra).
- **ETa (Actual Evapotranspiration):** Evapotranspiración real diaria en mm/día.
- **ESI (Evaporative Stress Index):** Alerta temprana de sequía meteorológica.

### 4. Radar SAR Invariable ante Nubosidad (Sentinel-1 SAR Banda C)
- **VV / VH Backscatter:** Retrodispersión estructural para monitoreo continuo bajo nubes.
- **RVI (Radar Vegetation Index):** Biomasa estructural medida por polarimetría radar.

### 5. Radiación y Predicción de Rendimiento (Sentinel-5P & CAMS)
- **FAPAR (Fraction of Absorbed Photosynthetically Active Radiation):** Absorción de radiación solar para modelos de rendimiento de cosecha.
- **Aerosol Index / CO:** Monitoreo de quemas agrícolas e incendios forestales.
