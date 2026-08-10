import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/GlobeLife/',
  build: {
    outDir: 'dist-client',
    rollupOptions: {
      input: 'index.client.html',
    },
  },
})
