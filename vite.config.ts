import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/espn-api": {
        target: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/espn-api/, ""),
      },
    },
  },
})
