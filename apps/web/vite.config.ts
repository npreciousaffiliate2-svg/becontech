import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@campusone/contracts': path.resolve(__dirname, '../../packages/contracts/src'),
      '@campusone/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api/useoneid/lookup': {
        target: 'https://useoneid.com',
        changeOrigin: true,
        rewrite: () => '/api/v1/verify/lookup-user',
      },
    },
  },
});
