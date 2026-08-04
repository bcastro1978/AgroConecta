# Módulo 5: Autenticación y Gestión de Roles

## 📌 Resumen
Este módulo controla el acceso a la plataforma AgroConecta. Garantiza que cada usuario vea únicamente las herramientas e interfaces que corresponden a su perfil (Productor, Proveedor B2B, Comprador, o Administrador), protegiendo la privacidad de los datos satelitales y de negocio.

---

## 📖 Historias de Usuario

**HU-5.1: Registro Multi-Perfil**
> **Como** nuevo usuario,
> **Quiero** poder registrarme en la plataforma seleccionando mi rol específico (Productor, Proveedor o Comprador),
> **Para** que la plataforma me configure un perfil adaptado a mis necesidades comerciales.

**HU-5.2: Control de Acceso Basado en Roles (RBAC)**
> **Como** administrador de seguridad,
> **Quiero** que el sistema redirija automáticamente a cada usuario a su dashboard correspondiente al iniciar sesión,
> **Para** evitar que un proveedor B2B tenga acceso no autorizado a los polígonos privados de un productor.

---

## ⚙️ Especificaciones Funcionales

1. **Gestión de Identidad (Supabase Auth):** El sistema utiliza autenticación basada en correo y contraseña.
2. **Contexto de Autenticación Global (React Context):** Un proveedor de estado global (`AuthProvider.tsx`) escucha los cambios de sesión (`onAuthStateChange`) y mantiene en memoria los datos del usuario logueado.
3. **Flujo de Registro (`RegisterForm.tsx`):**
   - El formulario recopila nombre, teléfono, documento de identidad, y el tipo de rol (`role`).
   - Tras el registro exitoso en Supabase Auth, se inserta un registro espejo en la tabla pública `profiles` con los datos adicionales.
4. **Enrutamiento Condicional:** Dependiendo del campo `role` del perfil, el sistema renderiza dinámicamente `ProducerDashboard`, `SupplierDashboard`, `BuyerDashboard` o `AdminDashboard`.

---

## 🛠️ Especificaciones Técnicas

- **Proveedores de Autenticación:** Supabase Auth (Email/Password).
- **Tablas de Base de Datos:**
  - `auth.users` (Interna de Supabase).
  - `public.profiles`: `id` (UUID FK), `role` (varchar), `full_name` (varchar), `phone` (varchar), `document_id` (varchar).
- **Componentes React Clave:**
  - `src/components/auth/AuthProvider.tsx`
  - `src/components/auth/Login.tsx`
  - `src/components/auth/RegisterForm.tsx`
- **Políticas RLS (Row Level Security):** 
  - La tabla `profiles` debe permitir lectura a todos los usuarios autenticados para fines de matchmaking, pero solo permitir actualización (`UPDATE`) al dueño del perfil (`auth.uid() = id`).

---

## ⚠️ Consideraciones y Riesgos
- **Desincronización Auth vs Public:** Si el trigger de base de datos falla al crear el registro en `public.profiles` tras el registro en `auth.users`, el usuario quedará en un estado huérfano sin rol asignado. Se deben manejar transacciones robustas o triggers de base de datos directos (PostgreSQL Functions) en Supabase para la creación de perfiles.
