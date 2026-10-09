import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function githubPagesSpaPlugin(): Plugin {
  return {
    name: 'github-pages-spa',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      // 1. Generate dist/404.html as a copy of dist/index.html
      fs.copyFileSync(indexPath, path.join(distDir, '404.html'));

      // 2. Pre-generate physical directory index.html for known routes
      // This ensures GitHub Pages serves these routes directly with HTTP 200 OK
      const routes = [
        'about',
        'projects',
        'gallery',
        'certificates',
        'certificate',
        'features',
        'comments',
        'commission',
        'contact',
        'admin',
        'admin/dashboard'
      ];

      for (const route of routes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
      }

      // 3. Ensure CNAME and .nojekyll in dist
      const cnameSrc = path.resolve(__dirname, 'CNAME');
      const cnameDest = path.join(distDir, 'CNAME');
      if (fs.existsSync(cnameSrc)) {
        fs.copyFileSync(cnameSrc, cnameDest);
      } else {
        fs.writeFileSync(cnameDest, 'bintangprasetyo.com\n', 'utf8');
      }

      const nojekyllDest = path.join(distDir, '.nojekyll');
      fs.writeFileSync(nojekyllDest, '', 'utf8');

      const headersSrc = path.resolve(__dirname, 'public/_headers');
      const headersDest = path.join(distDir, '_headers');
      if (fs.existsSync(headersSrc)) {
        fs.copyFileSync(headersSrc, headersDest);
      }

      console.log('✓ GitHub Pages SPA routing configured (404.html & route directories generated)');
    }
  };
}

export default defineConfig(() => {
  const base = process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/';

  return {
    base,
    plugins: [react(), tailwindcss(), githubPagesSpaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) {
                return 'vendor-three';
              }
              if (id.includes('ogl')) {
                return 'vendor-ogl';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('react-router') || id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        clientPort: 443,
      },
    },
  };
});
