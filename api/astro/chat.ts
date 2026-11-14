// api/astro/chat.ts
// Serverless endpoint (Vercel / Node) for POST /api/astro/chat.
import {
  handleAstroChatRequest,
  streamAstroChatResponse,
  type AstroChatRequest,
} from '../../server/astroHandler.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const body: AstroChatRequest =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
    const ip =
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'serverless';

    const resolvedEnv = {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    };

    if (body.stream) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      await streamAstroChatResponse(body, resolvedEnv, ip, (chunk) => {
        if (!res.writableEnded) {
          res.write(JSON.stringify(chunk) + '\n');
        }
      });
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }

    const result = await handleAstroChatRequest(body, resolvedEnv, ip);

    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.data));
  } catch {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }
    if (!res.writableEnded) {
      res.end(JSON.stringify({ error: 'Failed to process Astro AI request.' }));
    }
  }
}

