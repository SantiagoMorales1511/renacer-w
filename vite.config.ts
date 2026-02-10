import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Accept-Ranges': 'bytes',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react-dom'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('react')) return 'vendor-react'
          }
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
  },
})
