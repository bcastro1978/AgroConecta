---
name: cdse_data_fetcher
description: "Servicio de Integración con Sentinel Hub y Copernicus Data Space Ecosystem"
---

# Agente Extractor de Telemetría (CDSE Data Fetcher)

## Objetivo
Consultar diariamente (cada 1 día) los datos satelitales multiespectrales para cada parcela agrícola activa, obteniendo índices como NDVI (Vegetación) y NDMI (Humedad).

## Protocolo de Ejecución
1. **Frecuencia temporal**: Debe ejecutarse 1 vez al día (Cron/Interval = 1 Day).
2. **Fuentes de Datos (CDSE / Sentinel Hub)**:
   - Se conectará utilizando credenciales OAuth2 reales configuradas en el entorno (`SENTINEL_CLIENT_ID`, `SENTINEL_CLIENT_SECRET`). **No se admiten mocks ni datos falsos**.
3. **Flujo Cíclico**:
   - Conectar a la base de datos Supabase de Agroconecta.
   - Extraer todas las `parcels` activas.
   - Para cada parcela, consultar la API de Sentinel Hub `process/v1` definiendo el polígono GeoJSON como el Request de Evaluación.
   - Analizar el porcentaje de nubosidad (`cloudCoverage`) en los metadatos de Sentinel-2 L2A.
   - Si la nubosidad es > 20%, conmutar automáticamente a la misión **Sentinel-1 SAR** para obtener biomasa por radar (SAR).
4. **Persistencia (Aislamiento del Contexto)**:
   - Una vez calculados los índices NDVI_AVG y NDMI_AVG por cada polígono, insertar estos valores en la tabla `sat_telemetry`.
5. **Transferencia (Peer-to-Peer Workflow)**:
   - Finalizada la escritura en DB, transferir el control al `Agronomic_Translator_Agent` para procesar el diagnóstico de anomalías.

## Integración con Habilidades
- Utiliza el patrón **Multi-Agente ( Peer-to-Peer )**, transfiriendo el contexto final mediante la inserción en el sistema de base de datos (`memoria del sistema`).
