// Splits long text into overlapping chunks that respect paragraph boundaries.
// Pure function (no dependencies) so it is easy to test.
export function chunkText(text, { size = 900, overlap = 150 } = {}) {
  const clean = String(text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!clean) return [];

  const pieces = [];
  for (const para of clean.split(/\n\n+/)) {
    if (para.length <= size) pieces.push(para);
    else for (let i = 0; i < para.length; i += size) pieces.push(para.slice(i, i + size));
  }

  const chunks = [];
  let cur = '';
  for (const piece of pieces) {
    if (cur && cur.length + piece.length + 2 > size) {
      chunks.push(cur.trim());
      let tail = cur.slice(-overlap);
      tail = tail.slice(tail.indexOf(' ') + 1); // start the overlap on a word boundary
      cur = tail + '\n\n' + piece;
    } else {
      cur = cur ? cur + '\n\n' + piece : piece;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}
