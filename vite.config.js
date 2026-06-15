import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const cookieRewriter = (proxy) => {
  proxy.on('proxyRes', (proxyRes) => {
    const setCookieHeaders = proxyRes.headers['set-cookie'];
    if (setCookieHeaders) {
      proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
        return cookie
          .replace(/Domain=[^;]+/gi, '')
          .replace(/Path=[^;]+/gi, '')
          .replace(/;\s*$/, '')
          + '; Domain=localhost; Path=/';
      });
    }
  });
};

const createProxyConfig = () => ({
  target: process.env.VITE_API_BASE_URL || 'http://localhost:8084',
  changeOrigin: true,
  secure: false,
  cookieDomainRewrite: 'localhost',
  configure: cookieRewriter,
});

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, './src/shared'),
      'entities': path.resolve(__dirname, './src/entities'),
      'components': path.resolve(__dirname, './src/components'),
      'pages': path.resolve(__dirname, './src/pages'),
      'app': path.resolve(__dirname, './src/app'),
    },
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
  optimizeDeps: {
    exclude: ['react-native'],
  },
  server: {
    port: 5174,
    proxy: {
      '**/*.json': createProxyConfig(),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        if (id.includes('.native.js') || id === 'react-native') {
          return true;
        }
        return false;
      },
    },
  },
})
