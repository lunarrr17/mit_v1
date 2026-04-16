import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin in dev: avoids CORS / "Failed to fetch" when UI is localhost:5173 and API is 127.0.0.1:5002
      '/auth-gateway': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-gateway/, '') || '/',
      },
    },
  },
})
