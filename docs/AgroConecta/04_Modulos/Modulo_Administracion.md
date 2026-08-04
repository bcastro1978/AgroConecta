# Módulo 8: Administración y Gerencia Regional

## 📌 Resumen
El backend visual de la plataforma. Diseñado para los dueños de AgroConecta y los gerentes regionales (Branch Managers). Permite administrar a los usuarios, visualizar macro-estadísticas de la plataforma y gestionar zonas de operación.

---

## 📖 Historias de Usuario

**HU-8.1: Macro-Estadísticas (Admin)**
> **Como** administrador general de AgroConecta,
> **Quiero** ver cuántos agricultores activos, parcelas registradas y proveedores existen en la plataforma,
> **Para** medir el impacto social y crecimiento comercial del ecosistema.

**HU-8.2: Gestión de Delegaciones (Branch Manager)**
> **Como** Gerente Regional,
> **Quiero** poder asignar recursos o visualizar el estado agrario global de mi provincia asignada,
> **Para** coordinar políticas públicas o logística masiva con las cooperativas.

---

## ⚙️ Especificaciones Funcionales

1. **Dashboard de Administrador (`AdminDashboard.tsx`):**
   - Panel de control God-Mode que lista y audita las actividades de la red.
   - Supervisión de consumo de las APIs (Gemini y Copernicus).
2. **Dashboard de Branch Manager (`BranchManager.tsx`):**
   - Filtros geográficos anclados a una provincia/cantón en específico.
   - Herramientas de reporte para ONGs o WIPO GREEN.

---

## 🛠️ Especificaciones Técnicas

- **Componentes:** `AdminDashboard.tsx`, `BranchManager.tsx`.
- **Seguridad RLS:** Acceso estrictamente protegido en Supabase mediante políticas de *Row Level Security* que verifiquen el claim de `role = 'admin'`.

---

## ⚠️ Consideraciones y Riesgos
- **Privacidad de la Data Sensible:** Si ocurre una filtración de permisos, un usuario podría acceder a la macro-data agronómica nacional, lo que es inteligencia económica sensible. Las políticas RLS deben ser testeables y robustas.
