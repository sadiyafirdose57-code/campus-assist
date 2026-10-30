import { config } from '../config.js';
import { extractiveAnswer } from './fallback.js';

const systemPrompt = () => `You are Campus Assist, the student help assistant for ${config.collegeName}.
Answer using ONLY the college documents provided in the context.
- Reply in clear, simple English, even if the student writes in Hinglish or another language.
- Be short and practical: give the answer first, then steps, deadlines or contacts if the documents mention them.
- If the documents do not contain the answer, say so plainly and tell the student which office to contact. Never invent rules, dates, fees or phone numbers.
- Be friendly, like a helpful senior student.`;

function buildContext(chunks) {
  if (!chunks.length) return '(no matching documents found)';
  return chunks.map((c, i) => `[${i + 1}] ${c.title} (${c.category})\n${c.text}`).join('\n\n');
}

async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM request failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const providers = {
  async anthropic({ system, messages }) {
    const { key, model } = config.llm.anthropic;
    const data = await postJson(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      { model, max_tokens: 700, system, messages }
    );
    return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  },
  async openai({ system, messages }) {
    const { key, model } = config.llm.openai;
    const data = await postJson(
      'https://api.openai.com/v1/chat/completions',
      { Authorization: `Bearer ${key}` },
      { model, max_tokens: 700, messages: [{ role: 'system', content: system }, ...messages] }
    );
    return data.choices[0].message.content;
  },
  async google({ system, messages }) {
    const { key, model } = config.llm.google;
    const data = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {},
      {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      }
    );
    return data.candidates[0].content.parts.map((p) => p.text).join('');
  },
};

export async function generateAnswer({ question, history = [], chunks }) {
  const provider = providers[config.llm.provider];
  if (!provider) return { text: extractiveAnswer(chunks), mode: 'extractive' };

  const hist = history.slice(-6).map((m) => ({ role: m.role, content: m.content }));
  while (hist.length && hist[0].role !== 'user') hist.shift(); // providers need a user turn first
  const messages = [
    ...hist,
    { role: 'user', content: `College documents:\n${buildContext(chunks)}\n\nStudent question: ${question}` },
  ];
  try {
    const text = await provider({ system: systemPrompt(), messages });
    return { text: text.trim(), mode: config.llm.provider };
  } catch (err) {
    console.error('[llm]', err.message);
    return { text: extractiveAnswer(chunks), mode: 'extractive' };
  }
}
