/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Definir en `.env`; si falta, el cliente usa `/api` (ver `session-store`). */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_API_VERSION?: string
  readonly VITE_COLLAB_API_VERSION?: string
  readonly VITE_MEDIA_API_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
