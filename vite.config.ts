import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // On ajuste ici pour ne cibler QUE les fichiers .ts qui contiennent du JSX
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/, // Accepte .ts, .tsx, .js, .jsx
    exclude: [],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
