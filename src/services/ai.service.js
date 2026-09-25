import { apiClient } from './client';

export const aiService = {
  /**
   * Standard JSON chat request
   */
  chat: async (promptOrMessage) => {
    const prompt = typeof promptOrMessage === 'string' ? promptOrMessage : promptOrMessage?.prompt || promptOrMessage?.message;
    const body = { prompt, message: prompt };

    try {
      const res = await apiClient('/ai/chat', {
        method: 'POST',
        body,
      });
      return res?.data || res;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient('/ai/assistant/chat', {
          method: 'POST',
          body,
        });
        return res?.data || res;
      }
      throw err;
    }
  },

  /**
   * Real-time Server-Sent Events (SSE) streaming chat with Gemini AI
   */
  streamChat: async (prompt, { onChunk, onComplete, onError, signal } = {}) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/api`
      : '/api';
    const token = localStorage.getItem('marketlink_token');
    const url = `${baseUrl}/ai/chat/stream?prompt=${encodeURIComponent(prompt)}`;

    let fullText = '';

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      });

      if (!response.ok) {
        // Fallback to standard POST chat if SSE stream is not active
        const fallbackRes = await aiService.chat(prompt);
        const reply = fallbackRes?.reply || fallbackRes?.data?.reply || fallbackRes?.message || (typeof fallbackRes === 'string' ? fallbackRes : '');
        if (onChunk && reply) onChunk(reply, reply);
        if (onComplete) onComplete(reply);
        return reply;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const chunkText = parsed.chunk || parsed.text || parsed.message || parsed.content || '';
              if (chunkText) {
                fullText += chunkText;
                if (onChunk) onChunk(chunkText, fullText);
              }
            } catch {
              // Raw text chunk
              fullText += dataStr;
              if (onChunk) onChunk(dataStr, fullText);
            }
          }
        }
      }

      if (onComplete) onComplete(fullText);
      return fullText;
    } catch (err) {
      if (err.name === 'AbortError') {
        if (onComplete) onComplete(fullText);
        return fullText;
      }
      // If streaming fetch fails completely, attempt fallback once
      try {
        const fallbackRes = await aiService.chat(prompt);
        const reply = fallbackRes?.reply || fallbackRes?.data?.reply || fallbackRes?.message || '';
        if (onChunk && reply) onChunk(reply, reply);
        if (onComplete) onComplete(reply);
        return reply;
      } catch (fallbackErr) {
        if (onError) onError(fallbackErr || err);
        throw fallbackErr || err;
      }
    }
  },
};

export const aiApi = aiService;
export default aiService;
