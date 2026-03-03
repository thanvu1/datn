import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait(),],
  assetsInclude: ['**/*.wasm'],
  server: {
    fs: {
      // Cho phép truy cập vào node_modules để lấy file wasm
      allow: ['..'],
    },
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: [
      '@myriaddreamin/typst.ts',
      '@myriaddreamin/typst-ts-web-compiler',
      '@myriaddreamin/typst-ts-renderer'
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
