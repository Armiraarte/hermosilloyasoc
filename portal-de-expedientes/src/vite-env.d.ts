/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_LOCAL_PHP_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
