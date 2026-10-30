import 'dotenv/config';

const list = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
const openaiKey = process.env.OPENAI_API_KEY || '';
const googleKey = process.env.GOOGLE_API_KEY || '';

function pickProvider() {
  const p = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (p) return p;
  if (anthropicKey) return 'anthropic';
  if (openaiKey) return 'openai';
  if (googleKey) return 'google';
  return 'none';
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_assist',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  corsOrigins: list(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  collegeName: process.env.COLLEGE_NAME || 'Your College',
  adminEmails: list(process.env.CAMPUS_ADMIN_EMAILS).map((e) => e.toLowerCase()),
  llm: {
    provider: pickProvider(),
    anthropic: { key: anthropicKey, model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5' },
    openai: { key: openaiKey, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
    google: { key: googleKey, model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash' },
  },
};

if (config.nodeEnv === 'production' && config.jwtSecret === 'dev-only-secret') {
  throw new Error('Set JWT_SECRET in production.');
}
