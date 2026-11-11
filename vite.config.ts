/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 設定
// - base 使用相對路徑 './'：搭配 HashRouter，網站放在 GitHub Pages 任何子路徑（例如 /rewire/）都能正確載入靜態資源。
// - outDir 輸出到 docs/：GitHub Pages 設定「Deploy from a branch → main → /docs」即可直接提供網站，不需要 GitHub Actions。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // 將圖表函式庫獨立切塊，首頁載入更輕量
        manualChunks: {
          recharts: ['recharts'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
