# GPilot

A chat interface for the [PolyG](https://github.com/Liu-rj/PolyG) GraphRAG system.

## Architecture

```
Browser  ←→  React frontend (Vite, port 5173)
                   ↓  /api/*  (dev proxy → prod CORS)
             FastAPI backend (uvicorn, port 8080)
                   ↓
             PolyG GraphRAG  ←→  Neo4j (port 7687)
                   ↓
             OpenAI / DeepSeek API
```

## Current Project Flow

### Chat runtime flow

1. User opens the React app in `gpilot-web`.
2. `App.tsx` loads chat history from Supabase when Supabase env vars are configured.
3. User creates or selects a chat from the sidebar.
4. User types a question in `ChatInput`.
5. `App.tsx` validates the question:
   - must not be empty
   - must be under `MAX_QUESTION_LENGTH`
6. Frontend builds the query URL:
   - development: `/api/query`
   - production: `https://gpilot.xyz/query`

7. Frontend sends:

```http
POST /api/query
```

with body:

```json
{
  "question": "user question",
  "dataset_id": "physics"
}
```

8. In local development, Vite proxies `/api/*` to the FastAPI backend on port `8080`.
9. In production, the browser calls `https://gpilot.xyz/query` through `App.tsx`'s `API_BASE_URL`.
10. FastAPI receives the request in `backend/main.py`.
11. Backend maps the frontend `dataset_id` to a PolyG dataset folder using `DATASET_MAP`.
12. Backend verifies the dataset exists under `POLYG_DATA_ROOT`.
13. Backend chooses the model:
    - request model if provided
    - otherwise `POLYG_DEFAULT_MODEL`
    - otherwise `openai/gpt-4o-mini`
14. Backend builds a PolyG `QueryParam` with local GraphRAG mode, traversal type, edge depth, and token limits.
15. Backend gets or creates a cached `GraphRAG` instance for `dataset + model`.
16. PolyG queries the Neo4j graph and model provider.
17. Backend returns:

```json
{
  "answer": "...",
  "dataset_name": "physics",
  "model": "openai/gpt-4o-mini",
  "traversal_type": "adaptive",
  "duration": 3.21,
  "token_count": 1842,
  "api_calls": 2
}
```

18. Frontend appends the assistant answer to the selected chat.
19. Frontend saves updated chat history to Supabase when configured.
20. If the backend, Neo4j, model provider, or dataset is unavailable, frontend maps the error to a user-facing message.

### PDF ingestion flow

This flow prepares graph content before chat queries happen.

1. Put PDFs in `backend/pdfs` or pass another folder with `--pdf-dir`.
2. Install backend dependencies:

```bash
cd GPilot/backend
python -m pip install -r requirements.txt
```

3. Run PDF extraction:

```bash
python ingest_pdfs.py --pdf-dir ./pdfs --output ./storage/extracted_terms.json
```

4. `ingest_pdfs.py` reads each PDF page with PyMuPDF.
5. It sends page text to the configured LLM through `litellm`.
6. The LLM returns JSON terms, definitions, categories, and relations.
7. The script merges duplicate terms across pages and papers.
8. The script writes `storage/extracted_terms.json`.
9. Optional Neo4j write:

```bash
python ingest_pdfs.py --pdf-dir ./pdfs --dataset papers --write-neo4j
```

10. Neo4j receives `(:Term)` nodes and sanitized relationship edges.
11. Future GraphRAG work can connect these ingested terms to PolyG's dataset/query path.

---

## Prerequisites

1. **PolyG** installed and datasets preprocessed — follow `/home/username/PolyG_correct_instructions.txt`
2. **Neo4j** running on `localhost:7687`
3. **Conda** environment `polyg` created (`python=3.12`)
4. **API key** for at least one supported model (OpenAI or DeepSeek)
5. **Supabase project** for browser chat history storage

---

## Quick Start

### 1. Configure the backend

```bash
cd GPilot/backend
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY and/or DEEPSEEK_API_KEY
```

### 2. Start the backend

```bash
# From GPilot/backend/ with the polyg conda env active:
conda activate polyg
bash start.sh
# → FastAPI running at http://localhost:8080
# → Docs at http://localhost:8080/docs
```

### 3. Start the frontend (development)

```bash
cd GPilot/gpilot-web
cp .env.example .env
# Edit .env — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
# → Vite dev server at http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to `localhost:8080`, so
**no CORS issues** during development.

### Supabase chat history

Run `supabase/chat_history.sql` in your Supabase SQL editor. The app stores one
shared browser-visible history in `public.chat_history`; there is no auth or
per-user isolation. Use this only for a private single-user project.

Frontend env vars:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## API Reference

| Method | Path        | Description                     |
|--------|-------------|---------------------------------|
| GET    | `/health`   | Health check                    |
| GET    | `/datasets` | List available PolyG datasets   |
| POST   | `/query`    | Send a question to PolyG        |

## PDF Term Ingestion

GPilot includes a small ingestion script that extracts terms and relations from
PDFs, writes a JSON artifact, and can also write `Term` nodes/relationships to
Neo4j.

Codex/workstation setup requirement:

```bash
cd GPilot/backend
python -m pip install -r requirements.txt
```

Do this before running `ingest_pdfs.py`. The ingestion script requires packages
from `backend/requirements.txt`, including `pymupdf` for PDF text extraction.

Then run:

```bash
cd GPilot/backend
python ingest_pdfs.py --pdf-dir ./pdfs --output ./storage/extracted_terms.json
```

To also write extracted terms to Neo4j using the existing `NEO4J_*` environment
variables:

```bash
python ingest_pdfs.py --pdf-dir ./pdfs --dataset papers --write-neo4j
```

Defaults:
- model: `PDF_INGEST_MODEL`, then `POLYG_DEFAULT_MODEL`, then `openai/gpt-4o-mini`
- PDF folder: `backend/pdfs`
- JSON output: `backend/storage/extracted_terms.json`

### POST /query

**Request body:**
```json
{
  "question": "What are the key aspects of the Josephson effect?",
  "dataset_id": "physics",
  "model": "openai/gpt-4o-mini",
  "traversal_type": "adaptive",
  "edge_depth": 1
}
```

`dataset_id` accepts:
- PolyG native: `physics`, `goodreads`, `amazon`
- Frontend legacy ids (mapped internally): `general`, `code`, `docs`, `data`, `science`

`model` accepts: `openai/gpt-4o`, `openai/gpt-4o-mini`, `deepseek/deepseek-chat`, `deepseek/deepseek-reasoner`

**Response:**
```json
{
  "answer": "...",
  "dataset_name": "physics",
  "model": "openai/gpt-4o-mini",
  "traversal_type": "adaptive",
  "duration": 3.21,
  "token_count": 1842,
  "api_calls": 2
}
```

---

## Production Deployment

For production, the browser should call the same-origin `/api` path on Vercel,
and Vercel should proxy those requests to your backend server using a server-side
`BACKEND_ORIGIN` environment variable. This keeps the backend URL out of the
browser bundle and lets you rotate backend hosts without changing the client.

Set this in the Vercel project:

```bash
BACKEND_ORIGIN=https://your-stable-backend.example.com
```

The Vercel proxy lives at `gpilot-web/api/[...path].ts`, so the frontend can
keep using `/api/query` in both local development and production.

To build the frontend locally:

```bash
cd gpilot-web
npm run build
# dist/ contains the static site

# Then serve with any static host, or mount inside the FastAPI app:
# app.mount("/", StaticFiles(directory="../gpilot-web/dist", html=True), name="static")
```

Set `ALLOWED_ORIGINS=https://g-pilot.vercel.app` in the backend `.env` when
serving the frontend from Vercel.
