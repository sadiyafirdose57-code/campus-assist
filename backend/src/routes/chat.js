import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Conversation } from '../models/Conversation.js';
import { requireAuth } from '../middleware/auth.js';
import { retrieve, toSources } from '../services/retrieval.js';
import { generateAnswer } from '../services/llm.js';

const router = Router();
router.use(requireAuth);

const askLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'You are asking too fast. Wait a minute and try again.' } });

const askSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  conversationId: z.string().optional(),
});

router.post('/', askLimiter, async (req, res) => {
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Type a question (up to 1000 characters).' });
  const { message, conversationId } = parsed.data;

  let convo = null;
  if (conversationId) {
    if (!mongoose.isValidObjectId(conversationId)) return res.status(400).json({ error: 'Invalid chat.' });
    convo = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
    if (!convo) return res.status(404).json({ error: 'Chat not found.' });
  } else {
    convo = new Conversation({ userId: req.user._id, title: message.slice(0, 60) });
  }

  const chunks = await retrieve(message);
  const sources = toSources(chunks);
  const { text, mode } = await generateAnswer({ question: message, history: convo.messages, chunks });

  convo.messages.push({ role: 'user', content: message });
  convo.messages.push({ role: 'assistant', content: text, sources });
  await convo.save();

  res.json({ conversationId: convo._id, title: convo.title, answer: text, sources, mode });
});

router.get('/conversations', async (req, res) => {
  const items = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(50).select('title updatedAt');
  res.json({ conversations: items });
});

router.get('/conversations/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid chat.' });
  const convo = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
  if (!convo) return res.status(404).json({ error: 'Chat not found.' });
  res.json({ conversation: convo });
});

router.delete('/conversations/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid chat.' });
  await Conversation.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ ok: true });
});

export default router;
