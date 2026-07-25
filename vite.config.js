import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // The content validator lives with the API routes so there is exactly
      // one copy shared by the server and the client.
      '@schema': fileURLToPath(new URL('./api/_lib/schema.js', import.meta.url)),
    },
  },
})
