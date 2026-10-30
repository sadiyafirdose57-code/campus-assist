import { Chunk } from '../models/Chunk.js';

const snippet = (text, n = 220) => (text.length > n ? text.slice(0, n).trimEnd() + '…' : text);

// Finds the document passages most relevant to a student's question.
export async function retrieve(query, limit = 4) {
  let rows = [];
  try {
    rows = await Chunk.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' }, title: 1, category: 1, text: 1, documentId: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  } catch {
    rows = [];
  }
  return rows.map((r) => ({
    documentId: String(r.documentId),
    title: r.title,
    category: r.category,
    text: r.text,
    snippet: snippet(r.text),
  }));
}

// Distinct documents behind the retrieved passages, shown to the student as sources.
export function toSources(chunks) {
  const seen = new Set();
  const out = [];
  for (const c of chunks) {
    if (seen.has(c.documentId)) continue;
    seen.add(c.documentId);
    out.push({ documentId: c.documentId, title: c.title, category: c.category, snippet: c.snippet });
  }
  return out;
}
