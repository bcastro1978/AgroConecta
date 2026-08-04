# Módulo 4: Matchmaking B2B (LangGraph Agents)

## 📌 Resumen
El objetivo de AgroConecta no es solo ser una herramienta de monitoreo, sino un mercado inteligente. Este módulo utiliza un grupo de agentes multi-IA (LangGraph) que analizan el estado de la parcela, deducen lo que necesita el agricultor basado en las alertas satelitales (ej. déficit de agua, plagas) y generan "Leads de Venta" o sugerencias de conexión B2B con empresas que venden esos servicios.

---

## 📖 Historias de Usuario

**HU-4.1: Interconexión B2B para Proveedores**
> **Como** proveedor de maquinaria agrícola (B2B),
> **Quiero** poder ver un mapa de calor donde haya parcelas sufriendo de estrés hídrico crónico,
> **Para** contactar a esos productores y ofrecerles mis sistemas de riego tecnificado por goteo, logrando una venta altamente focalizada.

**HU-4.2: Descubrimiento de Insumos Automático**
> **Como** productor en estado crítico,
> **Quiero** que el sistema recomiende empresas cercanas que me puedan vender el insumo que necesito (fertilizantes, mangueras),
> **Para** no perder tiempo buscando proveedores a ciegas mientras mi cosecha se pierde.

---

## ⚙️ Especificaciones Funcionales

1. **Pipeline Agéntico (Python/LangGraph):** El sistema posee un worker asíncrono (Python `agro_agents_api`) que escucha todas las alertas generadas por el "Agrónomo IA" (Módulo 2).
2. **Razonamiento de Oportunidad de Negocio (Analista B2B):** El agente de LangGraph clasifica las anomalías (ej. BSI alto y NDMI muy bajo -> Probabilidad 90% de necesitar sistemas de riego).
3. **Generación de Leads Calificados (MQL):** Al encontrar un match, el Agente inserta un lead en la tabla de `b2b_leads` (o notifica a la empresa asociada).
4. **Mapa de Oportunidades Agronómicas:** En el frontend (`B2BLeadsMap.tsx`), los proveedores B2B acceden a un visor cartográfico para explorar los pines y perfiles anonimizados de los productores que requieren ayuda (Smart Matchmaking).

---

## 🛠️ Especificaciones Técnicas

- **Framework de Agentes:** LangChain / LangGraph (Python) con ejecución en FastApi (`main.py`).
- **Nodos del Grafo:** 
  - `get_parcel_info`: Extrae metadata del productor.
  - `get_latest_copernicus_telemetry`: Recoge la información de los índices.
  - `get_b2b_providers`: Busca proveedores disponibles.
- **Flujo de Notificación:** (Futuro) Conexión vía WhatsApp (usando credenciales de Meta Developer) para alertar al Productor "El proveedor AgroSolutions te puede ayudar con tu problema de sequía hoy mismo, ¿Deseas contactarlo?".
- **Privacidad y GDPR/EUDR:** Las coordenadas exactas del productor no se envían al proveedor B2B a menos que el productor acepte el contacto inicial. (Privacidad por Diseño).

---

## ⚠️ Consideraciones y Riesgos
- **Latencia del Pipeline:** Múltiples LLMs hablando entre sí a través de LangGraph pueden generar tiempos de respuesta muy lentos. Es vital ejecutar esta capa de negocio de manera totalmente asíncrona, desvinculada del frontend principal, utilizando webhooks o polling (ej. colas en Redis o cron workers).
- **Falsos Positivos:** El agente B2B puede inferir necesidades equivocadas si la imagen satelital estaba ligeramente nublada pero pasó el filtro. La validación humana de Leads de Venta sigue siendo recomendada en etapas tempranas.
