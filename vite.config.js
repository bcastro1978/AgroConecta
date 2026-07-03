import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/cdse-auth': {
        target: 'https://identity.dataspace.copernicus.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cdse-auth/, '')
      },
      '/api/cdse-sh': {
        target: 'https://sh.dataspace.copernicus.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cdse-sh/, '')
      }
    }
  }
});
