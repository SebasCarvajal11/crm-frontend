import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { loadEnv } from "vite"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:28080"

  return {
    plugins: [react(), tailwindcss(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "lucide-react": path.resolve(__dirname, "./src/components/ui/cima-icon.tsx"),
      },
    },
    test: {
      exclude: [...configDefaults.exclude, "tests/playwright/**"],
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/')
            if (
              normalized.includes('components/ui/cima-icon') ||
              normalized.includes('components/ui/icons') ||
              normalized.includes('lucide-react')
            ) {
              return 'vendor-icons'
            }
            if (normalized.includes('/node_modules/')) {
              const pkg = normalized.split('/node_modules/').pop() || ''
              if (pkg.startsWith('react/') || pkg.startsWith('react-dom/') || pkg.startsWith('scheduler/')) {
                return 'vendor-core'
              }
              if (pkg.startsWith('pdf-lib/')) {
                return 'vendor-pdf'
              }
              if (pkg.startsWith('jszip/')) {
                return 'vendor-zip'
              }
              if (pkg.startsWith('@tanstack/')) {
                return 'vendor-tanstack'
              }
              if (
                pkg.startsWith('ky/') ||
                pkg.startsWith('zod/') ||
                pkg.startsWith('tailwind-merge/') ||
                pkg.startsWith('clsx/') ||
                pkg.startsWith('class-variance-authority/')
              ) {
                return 'vendor-utils'
              }
            }
          },
        },
      },
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
          "frame-src 'self' blob:",
          "media-src 'self' blob: data: https:",
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
