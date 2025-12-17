import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- CE BLOC RÈGLE TON ERREUR NETLIFY ---
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.ts$/, 
    exclude: [],
  },
  // ----------------------------------------
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
