"""
GPilot Backend — FastAPI server that wraps PolyG's GraphRAG engine.

Run from this directory:
    uvicorn main:app --host 0.0.0.0 --port 8080 --reload

Environment variables (set in the repo root .env, backend/.env, or export in shell):
    OPENAI_API_KEY      — required for openai/* models
    DEEPSEEK_API_KEY    — required for deepseek/* models
    NEO4J_URL           — default: neo4j://localhost:7687
    NEO4J_USER          — default: neo4j
    NEO4J_USERNAME      — accepted alias for NEO4J_USER
    NEO4J_PASSWORD      — default: neo4j1234
    POLYG_DATA_ROOT     — root directory containing dataset subdirs
                          default: /home/username/PolyG/dataset
    POLYG_DEFAULT_MODEL — default: openai/gpt-4o-mini
    ALLOWED_ORIGINS     — comma-separated CORS origins, default: *
"""

import os
import sys
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Bootstrap: ensure PolyG is importable
# ---------------------------------------------------------------------------
POLYG_ROOT = "/home/username/PolyG"
BACKEND_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

if POLYG_ROOT not in sys.path:
    sys.path.insert(0, POLYG_ROOT)

# Load the project-level .env first so local machine secrets can live at the repo
# root, then let backend/.env override when explicitly configured there.
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))
load_dotenv(dotenv_path=os.path.join(BACKEND_DIR, ".env"), override=False)

# PolyG imports (after path is set)
from polyg import GraphRAG, QueryParam          # noqa: E402
from polyg.storage import Neo4jStorage          # noqa: E402

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.WARNING)
logging.getLogger("polyg").setLevel(logging.INFO)

DATA_ROOT    = os.environ.get("POLYG_DATA_ROOT", "/home/username/PolyG/dataset")
DEFAULT_MODEL = os.environ.get("POLYG_DEFAULT_MODEL", "openai/gpt-4o-mini")
NEO4J_CONFIG = {
    "neo4j_url":  os.environ.get("NEO4J_URL",      "neo4j://localhost:7687"),
    "neo4j_auth": (
        os.environ.get("NEO4J_USER", os.environ.get("NEO4J_USERNAME", "neo4j")),
        os.environ.get("NEO4J_PASSWORD", "neo4j1234"),
    ),
}

# Dataset id  →  subfolder name under DATA_ROOT
# These match the DATASETS constant in the frontend types/index.ts
DATASET_MAP: dict[str, str] = {
    "physics":   "physics",
    "goodreads": "goodreads",
    "amazon":    "amazon",
    # frontend legacy ids — map to closest PolyG dataset
    "general":   "physics",
    "code":      "physics",
    "docs":      "goodreads",
    "data":      "amazon",
    "science":   "physics",
}

MAX_MODEL_LEN      = 128_000
MAX_CONTEXT_TOKENS = 90_000
MAX_OUTPUT_TOKENS  = 5_000

SUPPORTED_MODELS = {
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-reasoner",
}

# ---------------------------------------------------------------------------
# GraphRAG instance cache  (one per dataset × model combination)
# ---------------------------------------------------------------------------
_rag_cache: dict[str, GraphRAG] = {}


def get_rag(dataset_name: str, model: str) -> GraphRAG:
    key = f"{dataset_name}::{model}"
    if key not in _rag_cache:
        data_dir = os.path.join(DATA_ROOT, dataset_name)
        _rag_cache[key] = GraphRAG(
            dataset=dataset_name,
            model=model,
            model_max_token_size=MAX_MODEL_LEN,
            graph_storage_cls=Neo4jStorage,
            addon_params=NEO4J_CONFIG,
        )
    return _rag_cache[key]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly warm up the default dataset on startup (optional)
    try:
        get_rag("physics", DEFAULT_MODEL)
    except Exception as exc:
        logging.warning("Warm-up failed (non-fatal): %s", exc)
    yield


app = FastAPI(
    title="GPilot API",
    description="Backend that connects the GPilot frontend to the PolyG GraphRAG system.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the React dev server and any deployed origin
# ---------------------------------------------------------------------------
raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if raw_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------
class QueryRequest(BaseModel):
    question: str
    dataset_id: str = "general"          # frontend Dataset.id
    model: Optional[str] = None          # override model; uses DEFAULT_MODEL if omitted
    traversal_type: str = "adaptive"     # adaptive | BFS | cypher_single_entity | cypher_only
    edge_depth: int = 1


class QueryResponse(BaseModel):
    answer: str
    dataset_name: str
    model: str
    traversal_type: str
    duration: float
    token_count: int
    api_calls: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/datasets")
def list_datasets():
    """Return which PolyG datasets are available on disk."""
    available = []
    for frontend_id, ds_name in DATASET_MAP.items():
        path = os.path.join(DATA_ROOT, ds_name)
        available.append({
            "frontend_id": frontend_id,
            "dataset_name": ds_name,
            "available": os.path.isdir(path),
        })
    return {"datasets": available}


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    # --- resolve dataset ---
    dataset_name = DATASET_MAP.get(req.dataset_id)
    if not dataset_name:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown dataset_id '{req.dataset_id}'. "
                   f"Valid ids: {list(DATASET_MAP.keys())}",
        )

    data_dir = os.path.join(DATA_ROOT, dataset_name)
    if not os.path.isdir(data_dir):
        raise HTTPException(
            status_code=503,
            detail=f"Dataset '{dataset_name}' is not available on this server "
                   f"(expected at {data_dir}). Check POLYG_DATA_ROOT.",
        )

    # --- resolve model ---
    model = req.model or DEFAULT_MODEL
    if model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model '{model}'. Supported: {sorted(SUPPORTED_MODELS)}",
        )

    # --- build query params ---
    query_param = QueryParam(
        mode="local",
        edge_depth=req.edge_depth,
        local_context_length=MAX_CONTEXT_TOKENS,
        traversal_type=req.traversal_type,
        response_type=(
            "a sentence or a paragraph based on the provided information, "
            "concise while comprehensive about details."
        ),
        token_ratio_for_node=0.5,
        token_ratio_for_edge=0.4,
        failure_retries=3,
    )

    # --- run PolyG in a thread so we don't block the event loop ---
    try:
        rag = get_rag(dataset_name, model)
        loop = asyncio.get_event_loop()
        response, duration, token_len, api_calls, _ = await loop.run_in_executor(
            None,
            lambda: rag.query(req.question, {}, param=query_param),
        )
    except Exception as exc:
        logging.exception("PolyG query failed")
        raise HTTPException(status_code=500, detail=str(exc))

    return QueryResponse(
        answer=str(response),
        dataset_name=dataset_name,
        model=model,
        traversal_type=req.traversal_type,
        duration=duration,
        token_count=token_len,
        api_calls=api_calls,
    )
