/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEOAPIFY_API_KEY: string;
  readonly VITE_BACKEND_URL_DEV: string;
  readonly VITE_BACKEND_URL_PROD: string;
  readonly VITE_ENVIRONMENT: "development" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
