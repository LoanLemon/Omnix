import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/gui'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@engine': path.resolve(__dirname, './src/engine'),
      },
    },
    build: {
      sourcemap: false,
    }
  };
});
