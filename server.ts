import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// HTTP Security Headers (Mozilla Observatory A+ Grade)
const CSP_DIRECTIVES = [
  "default-src 'self' https://bintangprasetyo.com https://*.bintangprasetyo.com https://www.google.com https://www.gstatic.com https://recaptcha.google.com https://www.recaptcha.net",
  "script-src 'self' 'unsafe-eval' https://bintangprasetyo.com https://*.bintangprasetyo.com https://www.google.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://recaptcha.google.com https://www.recaptcha.net https://static.cloudflareinsights.com",
  "script-src-elem 'self' 'unsafe-eval' https://bintangprasetyo.com https://*.bintangprasetyo.com https://www.google.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://recaptcha.google.com https://www.recaptcha.net https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://*.google.com https://www.gstatic.com https://*.googleusercontent.com https://images.unsplash.com https://bintangprasetyo.com https://*.bintangprasetyo.com",
  "media-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
  "connect-src 'self' https://bintangprasetyo.com https://*.bintangprasetyo.com https://api.cloudinary.com https://*.cloudinary.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://firebase.googleapis.com https://appcheck.firebase.io https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://bintangprasetyo-porto.firebaseapp.com https://bintangprasetyo-porto.firebasestorage.app https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://recaptcha.google.com https://www.recaptcha.net https://cloudflareinsights.com https://static.cloudflareinsights.com ws: wss:",
  "frame-src 'self' https://www.google.com https://recaptcha.google.com https://www.recaptcha.net https://*.firebaseapp.com https://bintangprasetyo-porto.firebaseapp.com",
  "child-src 'self' blob: https://www.google.com https://recaptcha.google.com https://www.recaptcha.net https://*.firebaseapp.com https://bintangprasetyo-porto.firebaseapp.com",
  "worker-src 'self' blob: https://www.google.com https://www.gstatic.com https://recaptcha.google.com https://www.recaptcha.net",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://*.run.app https://*.google.com https://aistudio.google.com https://bintangprasetyo.com https://*.bintangprasetyo.com"
].join('; ');

app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  res.setHeader('Content-Security-Policy', CSP_DIRECTIVES);
  next();
});

// Setup Vite Dev server middleware or static server
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const httpServer = http.createServer(app);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Applet running at http://0.0.0.0:${PORT}`);
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Applet running at http://0.0.0.0:${PORT}`);
    });
  }
}

setupServer().catch((err) => {
  console.error("[Server] Failed to start server:", err);
});
