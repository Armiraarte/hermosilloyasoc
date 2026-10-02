# Portal de Expedientes

Proyecto independiente para la consulta de expedientes por parte del cliente.

## Frontend

1. Instala dependencias:
   `npm install`
2. Crea `.env.local` a partir de `.env.example`
3. Para trabajar local consumiendo datos del servidor usa:
   `npm run dev`

El frontend corre en `http://0.0.0.0:3000`.

Configuracion recomendada para desarrollo local conectado al servidor:

- `.env.local`
  `VITE_API_BASE_URL="https://expedientes.hermosilloyasoc.com"`

Con eso, el frontend local consulta directamente el backend publico del servidor en `/bd/...`.

Si necesitas revisar el backend PHP local de esta carpeta, puedes usar:

- `npm run dev:local`
- y activar `VITE_USE_LOCAL_PHP_PROXY="true"` solo para esa revision

## Backend PHP + MySQL

1. Copia `bd/portal_config.local.example.php` como `bd/portal_config.local.php`
2. Ajusta:
   - host
   - port
   - database
   - username
   - password
   - project_base_url
3. Para revision local puedes usar:
   `project_base_url = http://localhost:3000`
4. Si lo subes al dominio final, usa:
   `project_base_url = https://expedientes.hermosilloyasoc.com`
5. Confirma la conexion con:
   `http://127.0.0.1:8081/bd/test_admin_db.php`

Nota:
- El portal cliente local ya puede funcionar sin levantar este PHP local, siempre que `VITE_API_BASE_URL` apunte al backend publicado del servidor.

## Estructura

- `src/` contiene la interfaz del portal
- `bd/` contiene el backend PHP propio de este proyecto
- `sql/` contiene los scripts de base de datos

## Dominios

- Este proyecto puede publicarse de forma independiente en `https://expedientes.hermosilloyasoc.com`
- El sitio principal solo debe enlazar a este dominio
