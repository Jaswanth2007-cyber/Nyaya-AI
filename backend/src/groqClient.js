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
