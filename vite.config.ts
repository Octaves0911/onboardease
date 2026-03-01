import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3017,
    host: '0.0.0.0',
    allowedHosts: ['z6on57z3.run.complete.dev']
  },
  preview: {
    port: 3017,
    host: '0.0.0.0',
    allowedHosts: ['z6on57z3.run.complete.dev']
  }
})
