/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import eslintPlugin from '@nabla/vite-plugin-eslint'

export default defineConfig({
  // Fast refresh injects a preamble check that fails under Vitest, which
  // renders components without the index.html runtime.
  plugins: [react({ fastRefresh: !process.env.VITEST }), eslintPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.ts',
  },
  server: {
    port: 4002,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
