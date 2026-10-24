import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const isHmrDisabled = process.env.DISABLE_HMR === 'true';

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const cliPort = parseInt(process.argv[portArgIndex + 1], 10);
    if (!Number.isNaN(cliPort) && cliPort > 0) return cliPort;
  }
  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT, 10);
    // In AI Studio preview containers, nginx owns 8080 and proxies to 3000
    if (!isProduction && process.env.APPLET_ID && envPort === 8080) {
      return 3000;
    }
    if (!Number.isNaN(envPort) && envPort > 0) return envPort;
  }
  return 3000;
}

const app = express();
app.disable('x-powered-by');
const PORT = resolvePort();

app.use(cors());
app.use(express.json());

// HTTP Security Headers (Mozilla Observatory A+ Grade, compact <2KB header budget for reverse proxies)
const devScriptInline = isProduction ? '' : " 'unsafe-inline'";
const devConnectOrigins = isProduction ? '' : ' https://*.run.app wss://*.run.app';

const CSP_DIRECTIVES = [
  "default-src 'self' https://bintangprasetyo.com https://*.bintangprasetyo.com https://*.google.com https://www.gstatic.com https://www.recaptcha.net",
  `script-src 'self' 'unsafe-eval'${devScriptInline} https://bintangprasetyo.com https://*.bintangprasetyo.com https://*.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.google-analytics.com https://www.recaptcha.net https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.cloudinary.com https://*.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.google.com https://www.gstatic.com https://*.googleusercontent.com https://images.unsplash.com https://bintangprasetyo.com https://*.bintangprasetyo.com",
  "media-src 'self' data: blob: https://*.cloudinary.com",
  `connect-src 'self' https://bintangprasetyo.com https://*.bintangprasetyo.com https://*.cloudinary.com https://*.googleapis.com https://appcheck.firebase.io https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.firebasestorage.app https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.google.com https://www.gstatic.com https://www.recaptcha.net https://cloudflareinsights.com https://static.cloudflareinsights.com${devConnectOrigins} ws: wss:`,
  "frame-src 'self' https://*.google.com https://www.recaptcha.net https://*.firebaseapp.com",
  "child-src 'self' blob: https://*.google.com https://www.recaptcha.net https://*.firebaseapp.com",
  "worker-src 'self' blob: https://*.google.com https://www.gstatic.com https://www.recaptcha.net",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://*.run.app https://*.google.com https://bintangprasetyo.com https://*.bintangprasetyo.com"
].join('; ');

app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  if (isProduction && !process.env.K_SERVICE) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  res.setHeader('Content-Security-Policy', CSP_DIRECTIVES);
  next();
});

function listenWithRetry(server: http.Server, port: number, maxRetries = 20, delayMs = 300): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && attempts < maxRetries) {
        attempts += 1;
        setTimeout(() => {
          server.close();
          server.listen(port, '0.0.0.0');
        }, delayMs);
        return;
      }
      server.off('listening', onListening);
      reject(err);
    };

    const onListening = () => {
      server.off('error', onError);
      console.log(`[Server] Applet running at http://0.0.0.0:${port}`);
      resolve();
    };

    server.on('error', onError);
    server.once('listening', onListening);
    server.listen(port, '0.0.0.0');
  });
}

// Setup Vite Dev server middleware or static server
async function setupServer() {
  const httpServer = http.createServer(app);
  let closeVite: (() => Promise<void>) | null = null;

  const shutdown = () => {
    httpServer.closeAllConnections?.();
    httpServer.close(() => {
      if (closeVite) {
        closeVite().finally(() => process.exit(0));
      } else {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(0), 1000).unref();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled
          ? false
          : {
              server: httpServer,
            },
      },
      appType: 'spa',
    });
    closeVite = () => vite.close();
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  await listenWithRetry(httpServer, PORT);
}

setupServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
  process.exit(1);
});
