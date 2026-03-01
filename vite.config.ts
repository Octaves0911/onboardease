import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3013,
    host: '0.0.0.0',
    allowedHosts: ['t2s2exlx.run.complete.dev']
  },
  preview: {
    port: 3013,
    host: '0.0.0.0',
    allowedHosts: ['t2s2exlx.run.complete.dev']
  }
})
