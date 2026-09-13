// Thin wrapper around the Claude Messages API using the built-in fetch
// (Node 18+), so this project has zero SDK dependency to keep it easy to
// read end-to-end.
const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.NOVA_MODEL || 'claude-sonnet-4-5-20250929';

async function sendMessage(messages, { system, maxTokens = 1024 } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key from console.anthropic.com.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Claude API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.content.map(block => block.text || '').join('');
}

module.exports = { sendMessage };
