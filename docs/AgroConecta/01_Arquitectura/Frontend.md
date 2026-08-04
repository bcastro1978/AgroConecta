# Arquitectura Frontend - AgroConecta

## Visión General
El frontend de AgroConecta es una Single Page Application (SPA) orientada a la visualización de datos geoespaciales y gestión agronómica, construida con React y Vite.

## Estructura de Directorios Principal
- **`src/components/`**: Componentes reutilizables.
- **`src/pages/`**: Vistas principales (ej. Dashboard, Landing Page, Login).
- **`src/hooks/`**: Custom hooks (ej. `useAuth` para manejo de sesión con Supabase).
- **`src/lib/`**: Utilidades y configuración de Supabase client.
- **`src/types/`**: Definiciones de TypeScript para las entidades de la base de datos (Parcelas, Telemetría).

## Patrones de Diseño y UI
- **Manejo de Estado**: React Hooks (`useState`, `useEffect`) combinados con suscripciones a Supabase en tiempo real (si aplica).
- **Estilos**: Uso intensivo de **Tailwind CSS v4** asegurando un diseño "pixel-perfect", modo oscuro nativo, glassmorfismo y tipografía moderna para una experiencia de usuario de alta calidad.
- **Mapas Interactivos**: Implementados con `react-leaflet`. Manejan capas de mapas base, marcadores de polígonos GeoJSON (parcelas) e inserción de imágenes satelitales directamente sobre las coordenadas de las parcelas para un contexto geoespacial preciso.

## Integraciones Clave
- **Supabase JS**: Manejo directo de autenticación y consultas de datos (CRUD de parcelas y visualización de diagnósticos).
- **Reportes EUDR**: Funcionalidad de generación de PDFs estructurados usando `jspdf` con los lineamientos de TRACES NT (Zero Deforestación).
