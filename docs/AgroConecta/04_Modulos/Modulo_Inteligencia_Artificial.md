# Módulo 2: Agrónomo Virtual (Inteligencia Artificial)

## 📌 Resumen
Este módulo actúa como el puente cognitivo de AgroConecta. Recibe la metadata técnica incomprensible para el productor promedio (como que el NDVI bajó al 12% y el NDMI al 1.3%) y la convierte en una recomendación accionable, en lenguaje humano, redactada por un modelo generativo avanzado.

---

## 📖 Historias de Usuario

**HU-2.1: Diagnóstico Hídrico y Nutricional Automático**
> **Como** agricultor,
> **Quiero** recibir un texto explicativo tras cada escaneo satelital,
> **Para** saber si tengo que regar de emergencia o aplicar fertilizantes.

**HU-2.2: Generación de Hoja de Ruta**
> **Como** gerente de finca,
> **Quiero** que el sistema sugiera acciones correctivas específicas basadas en el cultivo (ej. Cacao vs Café),
> **Para** planificar las tareas semanales de mis jornaleros con precisión técnica.

---

## ⚙️ Especificaciones Funcionales

1. **Inyección de Prompt:** El sistema debe componer un prompt que mezcle datos estáticos (tipo de cultivo `active_crop`) con dinámicos (`ndvi`, `ndmi`, `bsi` de la última captura, y fecha actual).
2. **Generación de JSON Estricto:** La IA debe forzarse a responder siempre en un esquema JSON predefinido: `severity` (Alta, Media, Baja), `title` (Resumen corto), y `diagnosis` (Hoja de ruta sugerida).
3. **Parseo y Limpieza:** El sistema backend debe estar preparado para limpiar markdown accidental que la IA devuelva (ej. remover bloques de código \`\`\`json) antes de intentar procesar el objeto JSON con `JSON.parse()`.
4. **Fallback Lógico:** Si la API de Gemini falla o hay un timeout de red, el sistema debe inyectar de todas formas una alerta quemada ("WATER_STRESS") si el NDMI cae por debajo de `-0.1`, asegurando que la alerta crítica llegue al productor aunque la IA esté caída.

---

## 🛠️ Especificaciones Técnicas

- **Modelo Empleado:** `gemini-flash-latest` (V1Beta API GenerativeLanguage).
- **Ruta de Archivo Principal:** `src/lib/agriExpertAI.ts` y en el script cron `run_cron.js`.
- **Base de Datos (Supabase):** 
  - Tabla destino: `alerts_events`.
  - Campos: `parcel_id`, `severity` (enum: 'Baja', 'Media', 'Alta'), `anomaly_type` (debe incluir el prefijo 'Diagnóstico IA: ' + título), `action_suggested` (el cuerpo principal del diagnóstico).
- **Interfaz (UI):** Renderizado en el dashboard (ej. `AgronomicHealth.tsx`), donde debe usarse contraste de colores (ej. `#1E3F20`) en caso de fondos claros para asegurar que la "Hoja de Ruta" sea legible por el usuario.

---

## ⚠️ Consideraciones y Riesgos
- **Deprecación de Modelos:** Como sucedió con `gemini-1.5-flash`, los modelos son actualizados frecuentemente. Usar siempre el alias `-latest` o mantener configuraciones dinámicas.
- **Límites de Cuota (Rate Limits):** La API gratuita de Gemini tiene límites por minuto. Si se corre un CRON masivo sobre miles de parcelas, se requerirá encolar y poner retrasos (sleep) entre llamadas, o adquirir tier de pago.
