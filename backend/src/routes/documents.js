import path from 'node:path';
import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { Document, CATEGORIES } from '../models/Document.js';
import { Chunk } from '../models/Chunk.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { extractText, ALLOWED_EXTENSIONS } from '../services/extract.js';
import { chunkText } from '../services/chunker.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only PDF, DOCX, TXT or MD files are allowed.'), ok);
  },
});

// Shared by the upload route and the seed script.
export async function ingestDocument({ title, category, filename, text, uploadedBy }) {
  const pieces = chunkText(text);
  if (!pieces.length) throw new Error('No readable text found in this file. Scanned PDFs need OCR first.');
  const doc = await Document.create({
    title, category, filename, uploadedBy,
    charCount: text.length, chunkCount: pieces.length,
  });
  await Chunk.insertMany(pieces.map((t, idx) => ({ documentId: doc._id, title, category, idx, text: t })));
  return doc;
}

router.get('/', async (_req, res) => {
  const documents = await Document.find().sort({ createdAt: -1 });
  res.json({ documents, categories: CATEGORIES });
});

router.post('/', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'Choose a file to upload.' });
      const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'Other';
      const title = (req.body.title || '').trim() || path.parse(req.file.originalname).name;
      const text = await extractText(req.file.buffer, req.file.originalname);
      const doc = await ingestDocument({
        title: title.slice(0, 140), category, filename: req.file.originalname, text, uploadedBy: req.user._id,
      });
      res.status(201).json({ document: doc });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid document.' });
  await Chunk.deleteMany({ documentId: req.params.id });
  await Document.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

export default router;
