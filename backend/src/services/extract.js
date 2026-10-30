import path from 'node:path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

export async function extractText(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return (await pdfParse(buffer)).text;
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer })).value;
  if (ext === '.txt' || ext === '.md') return buffer.toString('utf8');
  throw new Error(`Unsupported file type: ${ext || 'unknown'}. Use PDF, DOCX, TXT or MD.`);
}
