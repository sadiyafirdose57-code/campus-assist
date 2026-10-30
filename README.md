# Campus Assist

An AI chatbot that answers college students' everyday doubts (attendance, exams, fees, hostel, scholarships, placements, certificates) **from your college's own documents**, and shows the source next to every answer.

Built on the same shape as a classroom-polling platform like Spandan: a React + Vite frontend, an Express API, MongoDB, JWT login with Student/Admin roles, and a pluggable AI provider (Anthropic, OpenAI or Google).

## How it works

```
Student question → search college documents (MongoDB text index)
               → top passages + question sent to the AI provider
               → short answer + "pinned" source notices shown on the right
```

Admins upload PDF / DOCX / TXT / MD files. Each file is read, split into overlapping passages and indexed. Students only ever get answers grounded in those passages. If nothing matches, the bot says so and points to the right office instead of guessing.

No AI key? It still works: it shows the best matching passages from the documents.

## Quick start

Requirements: Node.js 20+, and MongoDB (local, Atlas, or `docker compose up -d` for a local one).

```bash
npm install
cp backend/.env.example backend/.env      # set JWT_SECRET, MONGODB_URI, an AI key (optional)
npm run seed                              # creates admin + 10 sample college documents
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3001/api/health
- Seeded admin: `admin@college.edu` / `Admin@12345` (change it!)

Anyone who registers with an email listed in `CAMPUS_ADMIN_EMAILS` becomes an admin. Everyone else is a student.

## Use your real college data

1. Sign in as admin, click the shield icon (Manage documents).
2. Upload your circulars, exam rules, fee notices, hostel rules, etc. and pick a category.
3. Delete the sample documents. Set `COLLEGE_NAME` in `backend/.env`.
4. Scanned (image-only) PDFs have no text; run OCR on them first.

## Choose the AI

Set one key in `backend/.env` (or set `LLM_PROVIDER` explicitly):

| Provider | Variables |
|---|---|
| Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| Google | `GOOGLE_API_KEY`, `GOOGLE_MODEL` |

## Project structure

```
campus-assist/
├── backend/
│   ├── src/
│   │   ├── app.js, index.js, config.js
│   │   ├── routes/        auth, chat, documents (admin)
│   │   ├── services/      chunker, extract, retrieval, llm, fallback
│   │   ├── models/        User, Document, Chunk, Conversation
│   │   ├── middleware/    JWT auth + admin guard
│   │   └── __tests__/     node:test unit tests  (npm test)
│   └── scripts/           seed.js + sample college documents
├── frontend/src/
│   ├── pages/             Login, Chat, Admin
│   ├── api.js, auth.jsx, components.jsx, styles.css
├── docker-compose.yml     local MongoDB
└── package.json           npm workspaces
```

## API

| Route | What it does |
|---|---|
| `POST /api/auth/register`, `/login`, `GET /me` | Accounts (JWT) |
| `POST /api/chat` | Ask a question → `{ answer, sources, conversationId }` |
| `GET/DELETE /api/chat/conversations[/:id]` | Chat history (per user) |
| `GET/POST/DELETE /api/documents` | Admin only: manage college documents |

## Production notes

- Set `NODE_ENV=production`, a strong `JWT_SECRET`, and `CORS_ORIGINS` to your site URL.
- `npm run build` creates `frontend/dist`; serve it with nginx and proxy `/api` to the backend (or set `VITE_API_URL` at build time).
- Run the API with pm2 or systemd.

## Ideas to extend

- Vector embeddings for smarter search (MongoDB Atlas Vector Search)
- Streaming answers, thumbs up/down feedback, unanswered-question report for admins
- Hindi/Hinglish voice input, WhatsApp or Telegram channel
- Department-wise documents and role-based visibility

MIT License
