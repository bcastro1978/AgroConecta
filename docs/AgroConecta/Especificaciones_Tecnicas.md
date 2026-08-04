# Especificaciones Técnicas y Configuración

## Stack Tecnológico
### Frontend (Portal Web)
- **Framework:** React 19 + Vite + TypeScript.
- **Estilos:** Tailwind CSS v4 + PostCSS.
- **Mapas y GIS:** Leaflet, React-Leaflet, `@lobo.cyber.ec/ecuador-geo` para capas territoriales ecuatorianas.
- **Exportación:** `jspdf` para generación de reportes EUDR/Traces NT.

### Backend y Base de Datos (BaaS)
- **Plataforma:** Supabase (PostgreSQL 15+).
- **Driver:** `@supabase/supabase-js`.
- **Autenticación:** Supabase Auth (Email/Password, roles).

### Backend Inteligencia Artificial (Microservicio Python)
- **Framework:** FastAPI.
- **Orquestación IA:** LangGraph, LangChain.
- **LLM Principal:** Google Gemini 2.5 Flash (`ChatGoogleGenerativeAI`).
- **Integraciones:** Copernicus Data Space Ecosystem (CDSE) para Sentinel 1/2.
- **Automatización/Webhooks:** Compatibilidad con n8n y Twilio (para WhatsApp).

## Configuración y Despliegue (Entorno)
El ecosistema requiere dos archivos `.env` (uno para frontend, otro para Python).

**Variables Críticas:**
```env
# Frontend y Python
VITE_SUPABASE_URL=https://<tu-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (REQUERIDO PARA AGENTES BACKGROUND)

# Inteligencia Artificial y GIS
GEMINI_API_KEY=AIza...
SENTINEL_CLIENT_ID=<id-cdse>
SENTINEL_CLIENT_SECRET=<secret-cdse>
```

## Skills de Agentes Empleados
El proyecto hace uso de "Skills" locales que guían el comportamiento de los agentes del IDE (Antigravity):
- **ui_ux_designer:** Garantiza que las interfaces creadas en el frontend usen diseño moderno, dark mode y tokens accesibles.
- **frontend_developer:** Asegura las mejores prácticas en React 19, integración de mapas GIS interactivos y manejo de estados.
