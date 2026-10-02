# Hermosillo y Asociados

Sitio web del despacho (Vite + React + Tailwind).

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Configuracion del backend PHP

Las credenciales se configuran localmente y no se incluyen en Git.

- Para el portal de la raiz, copia `bd/portal_config.local.example.php` como `bd/portal_config.local.php` y completa la conexion MySQL.
- Para `bd/config.php`, copia `bd/legacy_config.local.example.php` como `bd/legacy_config.local.php`, o define `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASS` en el servidor.
- El panel administrativo y el portal independiente incluyen sus propias instrucciones en sus carpetas.
