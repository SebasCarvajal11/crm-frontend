import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'cima-contracts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}', 'src/main.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: [
      'src/components/organisms/admin/user-table.tsx',
      'src/components/organisms/collab/task-column.tsx',
    ],
    rules: {
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/utils',
              message: 'Usa "@/shared/lib/utils" o "@/shared/lib".',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/organisms/admin/**/*.{ts,tsx}', 'src/components/organisms/admin-console.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth/*'],
              message: 'En admin UI usa "@/features/admin/*" en vez de "@/features/auth/*".',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/admin/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth/*', '@/features/collab/*'],
              message: 'En features/admin evita dependencias directas con otras features; usa shared o capas de admin.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/collab/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth/*', '@/features/admin/*'],
              message: 'En features/collab evita dependencias directas con otras features; usa shared o capas de collab.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/admin/*', '@/features/collab/*'],
              message: 'En features/auth evita acoplamiento con otras features; usa shared o capas propias de auth.',
            },
            {
              group: ['@/components/organisms/admin/*', '@/components/organisms/collab/*'],
              message: 'En features/auth evita importar organismos de admin o collab; usa shared o capas propias de auth.',
            },
            {
              group: ['@/components/templates/*'],
              message: 'En features/auth usa "@/pages"; los templates se consumen desde pages.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/templates/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message: 'En templates evita acoplamiento con features; recibe contenido por props/composicion.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/organisms/collab/**/*.{ts,tsx}', 'src/components/organisms/collab-panel.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth/*', '@/features/admin/*'],
              message: 'En collab UI usa "@/features/collab/*" o shared; evita acoplamiento con otras features.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/organisms/account/**/*.{ts,tsx}', 'src/components/organisms/account-panel.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/collab/*', '@/features/admin/*'],
              message: 'En auth/account UI usa "@/features/auth/*" o dependencias compartidas.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/playwright/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
