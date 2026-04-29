import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Metagenomics/', // Base path for GitHub Pages
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        taxonomy: 'taxonomy.html',
      },
    },
  },
});
