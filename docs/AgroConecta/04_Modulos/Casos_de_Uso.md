# Casos de Uso - AgroConecta

```mermaid
usecaseDiagram
    actor Productor
    actor ProveedorB2B
    actor SistemaIA

    usecase "Registrar y Dibujar Parcela" as UC1
    usecase "Consultar Diagnóstico de Salud" as UC2
    usecase "Validar EUDR (Cero Deforestación)" as UC3
    usecase "Consultar Especialista IA" as UC4
    usecase "Recibir Alertas Tempranas" as UC5
    usecase "Recibir Smart Leads B2B" as UC6
    usecase "Actualizar Telemetría Satelital" as UC7

    Productor --> UC1
    Productor --> UC2
    Productor --> UC3
    Productor --> UC4
    
    SistemaIA --> UC5
    SistemaIA --> UC6
    SistemaIA --> UC7
    
    ProveedorB2B --> UC6
```

## Descripción de Casos Principales

### 1. Monitoreo Autónomo y Generación de Leads (Batch)
- **Actor:** Sistema IA (Copernicus Agent)
- **Flujo:**
  1. El sistema lee todas las parcelas activas.
  2. Consulta la API de Sentinel Hub.
  3. Si hay nubes, usa Sentinel-1; de lo contrario, Sentinel-2.
  4. La IA (Gemini) evalúa los índices y determina la severidad.
  5. Si la severidad es "Alta", el sistema busca un proveedor B2B pertinente en la zona.
  6. Se genera un `b2b_smart_lead` y se envía una notificación al productor vía n8n (WhatsApp).

### 2. Consulta a Especialistas (Chat Inteligente)
- **Actor:** Productor
- **Flujo:**
  1. El productor envía una pregunta o una foto de una hoja enferma vía WhatsApp.
  2. El `Supervisor` (LangGraph) recibe el mensaje y decide a qué especialista rutear (ej. `pest_specialist`).
  3. Si el productor pregunta por clima, se rutea al `meteorologist`.
  4. El agente especialista elabora la respuesta basada en telemetría o visión computacional (Manejo Integrado de Plagas).
  5. El productor recibe el consejo en su teléfono en tiempo real.
