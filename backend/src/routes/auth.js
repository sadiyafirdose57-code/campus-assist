import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter your name, a valid email and a password of at least 8 characters.' });
  }
  const { name, email, password } = parsed.data;
  if (await User.findOne({ email })) return res.status(409).json({ error: 'This email is already registered. Sign in instead.' });

  const role = config.adminEmails.includes(email) ? 'admin' : 'student';
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter your email and password.' });
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
