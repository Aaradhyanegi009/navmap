import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Dev Server Middleware that executes the Vercel Serverless Function handlers
 * in `/api/graph.js` and `/api/navigate.js` natively during local development.
 */
function vercelApiMiddleware() {
  return {
    name: 'vercel-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        // Parse query parameters
        const query = Object.fromEntries(urlObj.searchParams.entries());
        req.query = query;

        // Parse JSON body for POST/PUT requests
        if (req.method === 'POST' || req.method === 'PUT') {
          try {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf8');
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch (err) {
            req.body = {};
          }
        }

        // Enhance res with Vercel/Express-compatible helpers
        res.status = (statusCode) => {
          res.statusCode = statusCode;
          return res;
        };
        res.json = (payload) => {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(JSON.stringify(payload));
          return res;
        };

        try {
          if (pathname === '/api/graph') {
            const { default: graphHandler } = await import('./api/graph.js');
            return await graphHandler(req, res);
          }
          if (pathname === '/api/navigate') {
            const { default: navigateHandler } = await import('./api/navigate.js');
            return await navigateHandler(req, res);
          }
          res.status(404).json({ error: `API route ${pathname} not found` });
        } catch (error) {
          console.error('[API Middleware Error]:', error);
          res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), vercelApiMiddleware()],
  server: {
    port: 5173,
    host: true,
  },
});
