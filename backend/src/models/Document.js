import mongoose from 'mongoose';

export const CATEGORIES = [
  'Academics', 'Exams', 'Fees', 'Hostel', 'Scholarships',
  'Placements', 'Library', 'Campus Life', 'Other',
];

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    filename: { type: String, default: '' },
    charCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
