import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [
          '@babel/preset-react',
          '@babel/preset-typescript'
        ],
        plugins: []
      }
    })
  ],
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    strictPort: true, // Don't try another port if 5173 is taken
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}) 