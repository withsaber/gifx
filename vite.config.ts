import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: './src/ui',
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        ui: resolve(__dirname, 'src/ui/index.html'),
      },
    },
  },
});
