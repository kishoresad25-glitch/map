import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.js', '.json'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
  },
});
