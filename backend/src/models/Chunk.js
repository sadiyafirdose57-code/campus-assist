import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', index: true, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Other' },
  idx: { type: Number, required: true },
  text: { type: String, required: true },
});

// Full-text search powers retrieval; title is weighted higher than body text.
chunkSchema.index({ title: 'text', text: 'text' }, { weights: { title: 3, text: 1 }, name: 'chunk_text' });

export const Chunk = mongoose.model('Chunk', chunkSchema);
