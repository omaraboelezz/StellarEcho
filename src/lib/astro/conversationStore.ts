// src/lib/astro/conversationStore.ts
//
// Manages Astro AI conversation history with bounded memory so context stays relevant
// without growing unboundedly.

export interface AstroMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  mode?: 'gemini' | 'local_kb';
}

const STORAGE_KEY = 'solar_atlas_astro_chat_v1';
const MAX_STORED_MESSAGES = 24;
const MAX_API_HISTORY_TURNS = 10;

export function loadConversationHistory(): AstroMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m) =>
          m &&
          typeof m.id === 'string' &&
          (m.role === 'user' || m.role === 'model') &&
          typeof m.text === 'string'
      )
      .slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

export function saveConversationHistory(messages: AstroMessage[]): void {
  try {
    const bounded = messages.slice(-MAX_STORED_MESSAGES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
  } catch {
    // Ignore storage quota issues
  }
}

export function clearConversationHistory(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage issues
  }
}

/** Extracts the bounded recent turns to send to `/api/astro/chat`. */
export function toApiHistory(messages: AstroMessage[]): Array<{ role: 'user' | 'model'; text: string }> {
  return messages.slice(-MAX_API_HISTORY_TURNS).map((m) => ({
    role: m.role,
    text: m.text,
  }));
}

