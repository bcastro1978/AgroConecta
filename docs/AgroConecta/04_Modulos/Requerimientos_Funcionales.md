# Requerimientos Funcionales - AgroConecta

## Perfil: Productor Agrícola
- **RF-01 Gestión de Parcelas:** El productor debe poder registrar, visualizar y editar los perímetros (polígonos GeoJSON) de sus parcelas agrícolas en un mapa interactivo.
- **RF-02 Telemetría Satelital:** El sistema debe proveer al productor un tablero con indicadores agronómicos (NDVI, NDMI, BSI) extraídos mediante el ecosistema Copernicus.
- **RF-03 Conmutación Anti-Nubes:** Si la cobertura de nubes supera el 20%, el sistema debe conmutar automáticamente de Sentinel-2 (óptico) a Sentinel-1 (Radar SAR) para medir la retrodispersión VV/VH y asegurar la continuidad del monitoreo.
- **RF-04 Alertas Tempranas:** El productor recibirá alertas automatizadas (clasificadas como Baja, Media o Alta severidad) basadas en el análisis de la IA sobre su cultivo.
- **RF-05 Asistente Experto IA:** El productor interactuará vía WhatsApp (o web) con un ecosistema de agentes (LangGraph) que actúan como especialistas agronómicos (Riego, Nutrición, Fitopatología, etc.).
- **RF-06 Validación EUDR:** El productor puede solicitar la validación de cero deforestación para cumplir con la normativa europea (EUDR) y exportar el GeoJSON resultante para la plataforma TRACES NT.

## Perfil: Proveedor B2B (Insumos, Maquinaria, Finanzas)
- **RF-07 Gestión de Catálogo:** Los proveedores pueden registrarse y definir sus áreas de cobertura y categorías de servicios.
- **RF-08 Smart Leads:** El proveedor recibirá oportunidades de negocio ("Leads") generadas automáticamente por la IA cuando un productor en su zona enfrente un problema agronómico que requiera sus productos/servicios.

## Perfil: Administrador / Sistema
- **RF-09 Ejecución Batch:** El sistema (vía cronjobs o workers) debe procesar de forma masiva y autónoma las parcelas registradas para actualizar la telemetría satelital.
- **RF-10 Discovery IA:** El sistema debe analizar la fenología histórica para clasificar cultivos y recomendar opciones de reconversión más rentables.
