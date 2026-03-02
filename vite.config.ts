import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3025,
    host: '0.0.0.0',
    allowedHosts: ['fkb8d2uj.run.complete.dev']
  },
  preview: {
    port: 3025,
    host: '0.0.0.0',
    allowedHosts: ['fkb8d2uj.run.complete.dev']
  }
})
