import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 300000,
        proxyTimeout: 300000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              console.warn(`[vite proxy] ${err.code} on ${req.method} ${req.url} (client aborted or backend restarted)`);
            } else {
              console.error('[vite proxy error]', err.message);
            }
            if (res && typeof res.writeHead === 'function' && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'Backend service connection reset or unavailable. Please ensure the backend server is running.',
                  code: err.code || 'PROXY_ERROR',
                })
              );
            }
          });
        },
      },
    },
  },
})
