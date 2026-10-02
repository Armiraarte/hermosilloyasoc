<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_gCFs2I2Dzj_L7lgWvTUjC8fLfbP0OW5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Configuracion del backend PHP

Las credenciales se configuran localmente y no se incluyen en Git.

- Para el portal de la raiz, copia `bd/portal_config.local.example.php` como `bd/portal_config.local.php` y completa la conexion MySQL.
- Para `bd/config.php`, copia `bd/legacy_config.local.example.php` como `bd/legacy_config.local.php`, o define `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASS` en el servidor.
- El panel administrativo y el portal independiente incluyen sus propias instrucciones en sus carpetas.
