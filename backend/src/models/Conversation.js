import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: [{ documentId: String, title: String, category: String, snippet: String }],
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, default: 'New chat' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
