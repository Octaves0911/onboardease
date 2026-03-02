import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sandbox server runs locally on port 4010.
// Vite proxies /ws/sandbox/* and /sandbox/* to it.
const SANDBOX_SERVER = 'http://localhost:4010';
const SANDBOX_WS     = 'ws://localhost:4010';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3021,
    host: '0.0.0.0',
    allowedHosts: ['oplsozyn.run.complete.dev'],

    proxy: {
      // WebSocket connections: /ws/sandbox/:userId  →  ws://localhost:4010
      '/ws/sandbox': {
        target: SANDBOX_WS,
        ws: true,
        changeOrigin: true,
      },
      // REST endpoints: /sandbox/*  →  http://localhost:4010
      '/sandbox': {
        target: SANDBOX_SERVER,
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 3021,
    host: '0.0.0.0',
    allowedHosts: ['oplsozyn.run.complete.dev'],
  },
})
