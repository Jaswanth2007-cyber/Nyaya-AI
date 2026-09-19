# Nyaya-AI

**AI Court / Legal Brief Simplification and Argument Drafting Assistant** — an educational web app that helps law students practice moot court and legal writing: paste in case facts, get a structured IRAC practice argument, stress-test it against an AI-generated opposition, and translate dense legal reasoning into plain language.

> Educational practice tool only. Not legal advice. All output references general legal principles/doctrines only — the AI is explicitly instructed to never fabricate case names or citations.

## Features

| Area | What it does |
|---|---|
| Case facts input | Text area for facts + legal issue, with subject (7 areas) and jurisdiction selectors, plus one-click sample scenarios |
| IRAC argument generation | Issue → Rule → Application → Conclusion, citing only general doctrines, with stated assumptions and limitations |
| Counterargument mode | Generates the opposition's strongest arguments, weaknesses in the student's position, and rebuttal directions |
| Plain-language explainer | Rewrites any legal reasoning for a first-year law student, with defined key terms and preserved nuance |
| Persistent disclaimer | Always-visible educational-only banner across the app |
| Export | Copy as Markdown, download as `.txt`, or export a formatted PDF brief |
| Session history | Save/restore/delete past sessions, stored in `localStorage` |
| Resilient demo mode | If the backend or API key is unavailable, the app transparently falls back to realistic mock output rather than breaking |
| Dark / light mode | Theme toggle on the Auth and Workspace screens (persisted to `localStorage`) |

Stretch features from the original spec (argument strength scoring, multi-round debate simulation, voice input, jurisdiction/subject templates) were intentionally **not** built, to keep the two implemented legal subject areas polished rather than spreading thin across "all of law."

## Architecture

```
frontend/  React 19 + TypeScript + Vite + Tailwind v4
                 |
                 |  fetch('/api/...')  — proxied in dev by vite.config.ts
                 v
backend/   Node.js + Express
                 |
                 |  chat.completions (JSON mode)
                 v
Groq API   (free tier — openai/gpt-oss-120b)
```

- The frontend never calls Groq directly — the backend holds the API key and owns all prompt engineering.
- Every backend response is validated JSON matching the exact TypeScript shapes in `frontend/src/types/legal.ts`.
- If the backend is unreachable, returns an error, or the API key isn't configured, `frontend/src/services/api.ts` transparently falls back to local mock data (`services/mockData.ts`) so the UI is always usable in a demo/offline setting.

## Anti-hallucination design

The single biggest risk called out in the original spec is the model inventing fake case citations. The backend's system prompt (`backend/src/prompts.js`) hard-codes:

- Only general legal principles/doctrines may be referenced (e.g. "offer-acceptance-consideration", "the reasonable person standard") — never a specific case name, statute section, or citation.
- Strict JSON-only output matching a fixed schema, enforced further by Groq's JSON response mode.
- A first-year-law-student register: precise but not needlessly dense.

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# then edit .env and set GROQ_API_KEY (free key: https://console.groq.com/keys)
npm start          # listens on http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173 (or next free port)
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see `frontend/vite.config.ts`), so no extra frontend configuration is needed.

## Tests

```bash
cd backend  && npm test   # node's built-in test runner — prompt-building & input validation
cd frontend && npm test   # vitest — export/formatting utilities
```

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react, jsPDF
- **Backend:** Node.js, Express, Groq API (`openai/gpt-oss-120b`, free tier)
- **Persistence:** `localStorage` for session history (per the MVP scope — no server-side database needed)
- **Testing:** Node's built-in test runner (backend), Vitest (frontend)

## Environment variables (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `GROQ_API_KEY` | Yes | Free key from console.groq.com/keys |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-120b` |
| `PORT` | No | Defaults to `8000`; must match the Vite proxy target |
| `CORS_ORIGIN` | No | Only needed for a production deployment with a separate frontend origin |
