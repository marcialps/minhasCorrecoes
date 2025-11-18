// Corrected: Use 'vitest/globals' for proper type detection
/// <reference types="vitest/globals" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
    }
  };
});