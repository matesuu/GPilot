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

---

## Prerequisites

1. **PolyG** installed and datasets preprocessed — follow `/home/username/PolyG_correct_instructions.txt`
2. **Neo4j** running on `localhost:7687`
3. **Conda** environment `polyg` created (`python=3.12`)
4. **API key** for at least one supported model (OpenAI or DeepSeek)

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
npm install
npm run dev
# → Vite dev server at http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to `localhost:8080`, so
**no CORS issues** during development.

---

## API Reference

| Method | Path        | Description                     |
|--------|-------------|---------------------------------|
| GET    | `/health`   | Health check                    |
| GET    | `/datasets` | List available PolyG datasets   |
| POST   | `/query`    | Send a question to PolyG        |

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
