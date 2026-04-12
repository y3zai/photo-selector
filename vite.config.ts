import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => ({
  // Electron loads the built app via file:// — relative paths resolve there.
  // The Cloudflare web build stays at '/' so nothing about that deploy changes.
  base: mode === 'electron' ? './' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}));
