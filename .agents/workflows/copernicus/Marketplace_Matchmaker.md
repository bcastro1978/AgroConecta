---
name: marketplace_matchmaker
description: "Motor B2B para emparejamiento de proveedores y productores"
---

# Marketplace Matchmaker Agent

## Objetivo
Vincular automáticamente "Alertas Rojas" agronómicas con los proveedores B2B existentes en la plataforma, generando leads altamente cualificados basados en proximidad de Radio de Cobertura y Necesidad Real (telemetría satelital).

## Protocolo de Ejecución
1. **Trigger**: Se invoca exclusivamente desde el `Agronomic_Translator_Agent` tras identificarse una anomalía severa.
2. **Entradas (Variables)**:
   - `parcel_geometry` (Polígono del campo afectado).
   - `anomaly_type` (Ej. Deficiencia Nitrogenada, Estrés Hídrico).
   - `severity_level` (Alta).
3. **Flujo de Ejecución (Razonamiento Espacial y Lógico)**:
   - Consultar la tabla `b2b_providers`. Utilizar funciones GIS si es preciso para intersectar o comprobar en qué radio geográfico de influencia se encuentra el campo afectado (`parcel_geometry` VS `coverage_area`).
   - Filtrar proveedores (`b2b_providers`) cuya `category` responda a la `anomaly_type`. (Ejemplo: Si la alerta es Sequía severa, buscar proveedores de "Maquinaria de Riego" compatibles).
   - Generar un _Lead_ interno anonimizando por defecto los datos del productor (manteniendo privacidada como se especificó en los Requisitos No Funcionales del proyecto). 
   - Publicar estos puntos calientes en el Endpoint/Vista del *Heatmap* de proveedores B2B para impulsar estrategias _proactivas_ de venta y cotización inteligente.
4. **Finalización**.
