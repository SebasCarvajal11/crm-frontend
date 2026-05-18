/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Definir en `.env`; si falta, el cliente usa `/api` (ver `session-store`). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
