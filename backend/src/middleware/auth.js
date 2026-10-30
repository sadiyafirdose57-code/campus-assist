import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, { expiresIn: '7d' });

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Please sign in.' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please sign in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}
