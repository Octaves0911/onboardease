import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3008,
    host: '0.0.0.0',
    allowedHosts: ['6fgpfakz.run.complete.dev']
  },
  preview: {
    port: 3008,
    host: '0.0.0.0',
    allowedHosts: ['6fgpfakz.run.complete.dev']
  }
})
