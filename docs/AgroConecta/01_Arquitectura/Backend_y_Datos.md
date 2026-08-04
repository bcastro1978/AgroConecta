# Arquitectura Backend y Datos - AgroConecta

El sistema se fundamenta en **Supabase (PostgreSQL)** como motor de base de datos y autenticación, apoyado por Row Level Security (RLS) para aislamiento de tenants (Productores y Proveedores).

## Modelo de Datos Principal

```mermaid
erDiagram
    users ||--o{ parcels : "posee"
    users ||--o{ b2b_providers : "gestiona"
    parcels ||--o{ sat_telemetry : "registra_historial"
    parcels ||--o{ alerts_events : "genera_alertas"
    alerts_events ||--o{ b2b_smart_leads : "dispara_leads"
    b2b_providers ||--o{ b2b_smart_leads : "recibe_oportunidad"

    users {
        uuid id PK
        text role "Producer, Admin, Provider"
        text full_name
        text phone_number
    }
    parcels {
        uuid id PK
        uuid producer_id FK
        text active_crop
        jsonb geometry "EPSG:4326 GeoJSON"
    }
    sat_telemetry {
        uuid id PK
        uuid parcel_id FK
        text mission "Sentinel-2 o Sentinel-1"
        decimal ndvi_avg
        decimal vv_avg
        decimal cloud_cover
    }
    alerts_events {
        uuid id PK
        text severity "Baja, Media, Alta"
        text anomaly_type
    }
    b2b_smart_leads {
        uuid id PK
        uuid provider_id FK
        text category_match
        text status
    }
```

## Reglas de Negocio (RLS)
- **Productores:** Solo pueden ver y editar la telemetría, alertas y geometría de sus propias parcelas.
- **Proveedores:** Pueden ver la información pública de otros proveedores y gestionar su propio perfil. Reciben leads B2B cuando la IA hace "match".
- **Sistema (Service Role):** El backend Python y los agentes cron operan ignorando el RLS (`service_role_key`) para actualizar masivamente los datos de todas las parcelas.
