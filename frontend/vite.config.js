import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Every request that starts with /api is sent to Laravel (php artisan serve).
// So React and Laravel work together without CORS problems.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
