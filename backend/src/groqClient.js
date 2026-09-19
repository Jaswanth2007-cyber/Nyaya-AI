const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GroqError';
    this.status = status || 502;
  }
}

export async function callGroqJson({ system, user }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError('GROQ_API_KEY is not set on the server. Add it to backend/.env (get a free key at https://console.groq.com/keys).', 500);
  }

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new GroqError(`Groq API returned HTTP ${res.status}: ${detail.slice(0, 300)}`, res.status === 401 ? 500 : 502);
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqError('Groq API returned an empty response.', 502);
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new GroqError('Groq API returned non-JSON content that could not be parsed.', 502);
  }
}

/**
 * Same call as callGroqJson, but requests token-level streaming from Groq and
 * invokes onDelta(text) as each chunk arrives, so the caller can forward live
 * progress to a client instead of waiting for the full generation to finish.
 * Resolves with the fully-parsed JSON object once the stream completes.
 */
export async function streamGroqJson({ system, user }, onDelta) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError('GROQ_API_KEY is not set on the server. Add it to backend/.env (get a free key at https://console.groq.com/keys).', 500);
  }

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      stream: true
    })
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new GroqError(`Groq API returned HTTP ${res.status}: ${detail.slice(0, 300)}`, res.status === 401 ? 500 : 502);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    lineBuffer += decoder.decode(value, { stream: true });
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const chunk = JSON.parse(payload);
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta?.(delta);
        }
      } catch {
        // Ignore partial/keep-alive lines that don't parse as complete JSON yet.
      }
    }
  }

  if (!full) {
    throw new GroqError('Groq API returned an empty streamed response.', 502);
  }

  try {
    return JSON.parse(full);
  } catch {
    throw new GroqError('Groq API returned non-JSON content that could not be parsed.', 502);
  }
}
