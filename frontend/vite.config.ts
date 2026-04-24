import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  const certPath = path.resolve(__dirname, '../certificates/localhost+2.pem');
  const keyPath = path.resolve(__dirname, '../certificates/localhost+2-key.pem');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0', 
      proxy: {
  '/api': {
      target: 'https://localhost:8443',
      changeOrigin: true,
      secure: false, // Vẫn để false vì mkcert là tự ký
      // BE có context /api nên KHÔNG dùng rewrite
      
      configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          // Ép các header HTTPS để Backend không từ chối
          proxyReq.setHeader('X-Forwarded-Proto', 'https');
          // Đảm bảo Host header khớp với target để vượt qua kiểm tra TLS
          proxyReq.setHeader('Host', 'localhost:8443');
        });
        
        proxy.on('error', (err, _req, _res) => {
          console.error('Vite Proxy Error:', err);
        });
      },
    },
  },
      https: isDev && fs.existsSync(certPath) ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      } : false,
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})