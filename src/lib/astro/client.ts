// src/lib/astro/client.ts
//
// Frontend client for the server-side `/api/astro/chat` endpoint.
// Never touches or stores API keys on the client; communicates exclusively with `/api/astro/chat`.

import { buildAstroContext, type ExplorationContextInput } from './contextBuilder';
import { toApiHistory, type AstroMessage } from './conversationStore';

export interface AstroApiResult {
  reply: string;
  model: string;
  mode: 'gemini' | 'local_kb';
  notice?: string;
}

const INITIAL_TIMEOUT_MS = 16_000;
const STREAM_IDLE_TIMEOUT_MS = 12_000;

export async function sendAstroMessage(params: {
  message: string;
  history: AstroMessage[];
  explorationContext: ExplorationContextInput;
  signal?: AbortSignal;
  onStreamUpdate?: (partialText: string) => void;
}): Promise<AstroApiResult> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(
    () => controller.abort(),
    INITIAL_TIMEOUT_MS
  );

  const resetTimer = (ms: number) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => controller.abort(), ms);
  };

  if (params.signal) {
    if (params.signal.aborted) {
      controller.abort();
    } else {
      params.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const structuredContext = buildAstroContext(params.explorationContext, params.message);

    const response = await fetch('/api/astro/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: params.message,
        history: toApiHistory(params.history),
        context: structuredContext,
        stream: true,
      }),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';

    // Streaming NDJSON response path
    if (response.ok && contentType.includes('application/x-ndjson') && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let finalModel = 'gemini-3.5-flash-lite';
      let finalMode: 'gemini' | 'local_kb' = 'gemini';
      let finalNotice: string | undefined;

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let parsed: any;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          return;
        }

        if (parsed.type === 'delta' && typeof parsed.text === 'string') {
          accumulatedText += parsed.text;
          params.onStreamUpdate?.(accumulatedText);
        } else if (parsed.type === 'done') {
          if (parsed.model) finalModel = parsed.model;
          if (parsed.mode) finalMode = parsed.mode;
          if (parsed.notice) finalNotice = parsed.notice;
        } else if (parsed.type === 'error') {
          throw new Error(parsed.error || 'Astro AI could not process that request right now.');
        }
      };

      while (true) {
        resetTimer(STREAM_IDLE_TIMEOUT_MS);
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line);
        }
      }

      if (buffer.trim()) {
        processLine(buffer);
      }

      const cleanReply = accumulatedText.trim();
      if (!cleanReply) {
        throw new Error('Received an empty response from Astro AI. Please tap Retry.');
      }

      return {
        reply: cleanReply,
        model: finalModel,
        mode: finalMode,
        notice: finalNotice,
      };
    }

    // Standard JSON fallback path
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.error ||
          (response.status === 429
            ? 'Astro AI rate limit reached. Please wait a few seconds and try again.'
            : 'Astro AI could not process that request right now. Please tap Retry.')
      );
    }

    if (!data?.reply || typeof data.reply !== 'string') {
      throw new Error('Received an empty response from Astro AI. Please tap Retry.');
    }

    params.onStreamUpdate?.(data.reply);

    return {
      reply: data.reply,
      model: data.model || 'gemini-3.5-flash-lite',
      mode: data.mode || 'gemini',
      notice: data.notice,
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out while waiting for Astro AI. Please tap Retry.');
    }
    throw new Error(err?.message || 'Unable to reach Astro AI right now. Please tap Retry.');
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

