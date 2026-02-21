import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      // Proxy /cms/* → https://cms.fabry-baumpflege.be/*
      // This eliminates CORS issues in local development.
      // In production (Vercel) an equivalent rewrite in vercel.json handles this.
      '/cms': {
        target: 'https://cms.fabry-baumpflege.be',
        changeOrigin: true,
        // Replace /cms prefix with /wp-json before forwarding to the CMS host
        rewrite: (path) => path.replace(/^\/cms/, '/wp-json'),
      },
    },
  },
})
