import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  handleAstroChatRequest,
  streamAstroChatResponse,
  type AstroChatRequest,
} from './server/astroHandler';

function astroAiServerPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');

  const attachMiddleware = (middlewares: any) => {
    middlewares.use('/api/astro/chat', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        next();
        return;
      }

      let rawBody = '';
      req.on('data', (chunk: Buffer) => {
        rawBody += chunk.toString('utf8');
        if (rawBody.length > 100_000) {
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = (rawBody ? JSON.parse(rawBody) : {}) as AstroChatRequest;
          const ip = req.socket?.remoteAddress || 'local';
          // Reload .env on each request in dev so updating GEMINI_API_KEY or GEMINI_MODEL works immediately
          const liveEnv = loadEnv(mode, process.cwd(), '');
          const resolvedEnv = {
            GEMINI_API_KEY:
              liveEnv.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
            GEMINI_MODEL:
              liveEnv.GEMINI_MODEL ||
              env.GEMINI_MODEL ||
              process.env.GEMINI_MODEL ||
              'gemini-3.5-flash-lite',
          };

          if (parsed.stream) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            await streamAstroChatResponse(parsed, resolvedEnv, ip, (chunk) => {
              if (!res.writableEnded) {
                res.write(JSON.stringify(chunk) + '\n');
              }
            });
            if (!res.writableEnded) {
              res.end();
            }
            return;
          }

          const result = await handleAstroChatRequest(parsed, resolvedEnv, ip);
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.data));
        } catch {
          if (!res.headersSent) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
          }
          if (!res.writableEnded) {
            res.end(JSON.stringify({ error: 'Invalid request payload.' }));
          }
        }
      });
    });
  };

  return {
    name: 'astro-ai-gemini-endpoint',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), astroAiServerPlugin(mode)],
  build: {
    chunkSizeWarningLimit: 850,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'vendor-three';
          if (id.includes('node_modules/@react-three/')) return 'vendor-r3f';
          if (id.includes('node_modules/framer-motion/')) return 'vendor-motion';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
        },
      },
    },
  },
}));
