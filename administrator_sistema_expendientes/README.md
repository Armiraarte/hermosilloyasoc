# Administrador Sistema Expedientes

Proyecto independiente para el panel administrativo de expedientes.

## Frontend

1. Instala dependencias:
   `npm install`
2. Crea `.env.local` a partir de `.env.example`
3. Para revision local usa:
   `npm run dev:local`
   - Este comando levanta PHP en `127.0.0.1:8000` y Vite en `http://0.0.0.0:3001`
   - Si prefieres arrancarlos por separado, `npm run dev` usara `/bd` automaticamente mientras PHP este corriendo en `127.0.0.1:8000`

Por defecto corre en `http://0.0.0.0:3001`.

Si frontend y PHP viven juntos dentro de esta carpeta, no necesitas `VITE_API_BASE_URL`.
Solo configuralo si el backend vivira en otra URL.

## Backend PHP + MySQL

1. Copia `bd/config.local.example.php` como `bd/config.local.php`
   - host
   - port
   - database
   - username
   - password
   - project_base_url
   - Para revision local usa `http://localhost:3001`
   - Para produccion usa la URL publica final del panel

2. Ejecuta `bd/setup_servidor_mysql.sql` en MySQL
   - Antes de ejecutarlo, reemplaza `TU_PASSWORD_MYSQL` en una copia local por la misma contrasena configurada en `bd/config.local.php`.

3. Ejecuta `bd/portal_expedientes_v1.sql` en MySQL

4. Confirma la conexion local abriendo:
   `http://127.0.0.1:8000/bd/test_admin_db.php`

5. Si ya publicaste el backend en servidor, confirma tambien la URL remota correspondiente

6. Credenciales semilla del admin:
   - usuario: `admin`
   - contrasena: `admin`

## Independencia del proyecto

- Esta carpeta ya puede subirse sola como proyecto independiente.
- Su carpeta `bd/` ya no depende del `bd/` del proyecto raiz.
- Puedes publicarlo en otro dominio o subdominio sin tocar el sitio principal.

## Donde modificar la logica

- `src/App.tsx`
  - carga de expedientes desde la base
  - insert de expediente
  - insert de calendario
  - upload de archivos
  - login del admin

- `src/services/dossiersApi.ts`
  - URL del backend
  - requests al folder `bd/`

- `bd/dossier_repository.php`
  - formato automatico de expediente
  - inserciones SQL
  - armado del JSON que React muestra dentro del expediente
