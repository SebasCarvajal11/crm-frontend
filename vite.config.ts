import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { loadEnv } from "vite"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:18080"

  return {
    plugins: [react(), tailwindcss(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      exclude: [...configDefaults.exclude, "tests/playwright/**"],
    },
    server: {
      headers: {
        // Mantiene paridad con snippets/security-headers.conf (producción).
        // blob: es requerido para workers de módulo que Vite sirve como blob: URLs.
        'Content-Security-Policy': [
          "default-src 'self'",
          // "script-src 'self' blob:",
          mode === 'development' ? "script-src 'self' 'unsafe-inline' blob:" : "script-src 'self' blob:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' blob: https: ws: wsc:",
          "worker-src 'self' blob:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      proxy: {
        // Keep the frontend coupled only to the gateway contract.
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
