#!/usr/bin/env python3
"""
Extract technical terms from PDFs and optionally write them to Neo4j.

Usage:
    python ingest_pdfs.py --pdf-dir ./pdfs --output ./storage/extracted_terms.json
    python ingest_pdfs.py --pdf-dir ./pdfs --write-neo4j

Environment:
    OPENAI_API_KEY / DEEPSEEK_API_KEY  Model provider key, depending on model.
    PDF_INGEST_MODEL                   Default: POLYG_DEFAULT_MODEL or openai/gpt-4o-mini.
    NEO4J_URL                          Default: neo4j://localhost:7687
    NEO4J_USER / NEO4J_USERNAME         Default: neo4j
    NEO4J_PASSWORD                     Default: neo4j1234
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env", override=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pdf-ingest")


@dataclass
class ExtractedRelation:
    relation: str
    related_term: str


@dataclass
class ExtractedTerm:
    term: str
    definition: str = ""
    category: str = "Term"
    relations: list[ExtractedRelation] = field(default_factory=list)
    source_papers: set[str] = field(default_factory=set)
    pages: set[int] = field(default_factory=set)
    context_snippets: list[dict[str, Any]] = field(default_factory=list)


def normalize_key(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def safe_rel_type(value: str) -> str:
    rel = re.sub(r"[^A-Za-z0-9_]+", "_", value.strip()).strip("_").upper()
    return rel or "RELATED_TO"


def extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", cleaned, flags=re.DOTALL | re.IGNORECASE)
    if fenced:
        cleaned = fenced.group(1).strip()

    try:
        obj = json.loads(cleaned)
        if isinstance(obj, dict):
            return obj
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    candidates: list[dict[str, Any]] = []
    for match in re.finditer(r"\{", cleaned):
        try:
            obj, _ = decoder.raw_decode(cleaned[match.start() :])
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            candidates.append(obj)

    candidates.sort(key=lambda obj: len(json.dumps(obj)), reverse=True)
    for obj in candidates:
        if "terms" in obj:
            return obj
    return {"terms": []}


def build_prompt(text: str, filename: str, page: int) -> str:
    page_text = text[-12_000:] if len(text) > 12_000 else text
    return f"""
Extract key technical terms, methods, materials, datasets, concepts, metrics, and tools from this PDF page.

Rules:
- Return JSON only. No markdown.
- Use exact terms from text when possible.
- Keep definitions short but specific.
- Include relations only when text supports them.
- Use relation names like uses, has_property, part_of, measured_by, improves, compares_with, causes, produces, depends_on.
- Do not invent facts.

JSON shape:
{{
  "terms": [
    {{
      "term": "exact term",
      "definition": "short technical definition grounded in this page",
      "category": "Material | Method | Metric | Dataset | Tool | Concept | Process | Other",
      "relations": [
        {{"relation": "uses", "related_term": "another exact term"}}
      ]
    }}
  ]
}}

PDF: {filename}
PAGE: {page}

TEXT:
{page_text}
"""


def call_model(prompt: str, model: str) -> dict[str, Any]:
    try:
        from litellm import completion
    except ImportError as exc:
        raise RuntimeError("Missing dependency: install backend requirements so `litellm` is available.") from exc

    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    content = response.choices[0].message.content or ""
    return extract_json_object(content)


def context_snippet(text: str, term: str, max_words: int = 60) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    needle = term.lower()
    for sentence in sentences:
        if needle in sentence.lower():
            return " ".join(sentence.split()[:max_words])
    return " ".join(text.split()[:max_words])


def merge_term(target: dict[str, ExtractedTerm], raw: dict[str, Any], pdf_name: str, page: int, text: str) -> None:
    name = str(raw.get("term", "")).strip()
    if not name:
        return

    key = normalize_key(name)
    existing = target.get(key)
    if existing is None:
        existing = ExtractedTerm(term=name)
        target[key] = existing

    definition = str(raw.get("definition", "")).strip()
    if len(definition) > len(existing.definition):
        existing.definition = definition

    category = str(raw.get("category", "")).strip()
    if category:
        existing.category = category

    existing.source_papers.add(pdf_name)
    existing.pages.add(page)
    snippet = {
        "text": context_snippet(text, name),
        "source_paper": pdf_name,
        "page": page,
    }
    if snippet not in existing.context_snippets:
        existing.context_snippets.append(snippet)

    seen = {(rel.relation, rel.related_term) for rel in existing.relations}
    for relation in raw.get("relations", []) or []:
        if not isinstance(relation, dict):
            continue
        rel_name = str(relation.get("relation", "")).strip()
        related = str(relation.get("related_term", "")).strip()
        if not rel_name or not related:
            continue
        item = (rel_name, related)
        if item not in seen:
            existing.relations.append(ExtractedRelation(rel_name, related))
            seen.add(item)


def extract_pdf_terms(pdf_path: Path, model: str) -> dict[str, ExtractedTerm]:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError("Missing dependency: install `pymupdf` from backend/requirements.txt.") from exc

    terms: dict[str, ExtractedTerm] = {}
    doc = fitz.open(pdf_path)
    logger.info("Processing %s (%s pages)", pdf_path.name, doc.page_count)

    for page_idx in range(doc.page_count):
        page_num = page_idx + 1
        text = doc.load_page(page_idx).get_text()
        if len(text.split()) < 20:
            continue

        prompt = build_prompt(text, pdf_path.name, page_num)
        try:
            data = call_model(prompt, model)
        except Exception as exc:
            logger.exception("Model call failed for %s page %s: %s", pdf_path.name, page_num, exc)
            continue

        page_terms = data.get("terms", []) if isinstance(data, dict) else []
        logger.info("Page %s: %s terms", page_num, len(page_terms))
        for raw in page_terms:
            if isinstance(raw, dict):
                merge_term(terms, raw, pdf_path.name, page_num, text)

    return terms


def to_json_terms(terms: dict[str, ExtractedTerm], dataset: str) -> list[dict[str, Any]]:
    output = []
    for key, term in sorted(terms.items(), key=lambda item: item[0]):
        output.append(
            {
                "term": term.term,
                "name_key": key,
                "definition": term.definition,
                "category": term.category,
                "dataset": dataset,
                "relations": [rel.__dict__ for rel in term.relations],
                "source_papers": sorted(term.source_papers),
                "pages": sorted(term.pages),
                "context_snippets": term.context_snippets,
            }
        )
    return output


def write_terms_json(terms: list[dict[str, Any]], output_path: Path, model: str, dataset: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "metadata": {
            "dataset": dataset,
            "model": model,
            "term_count": len(terms),
        },
        "terms": terms,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    logger.info("Wrote %s terms to %s", len(terms), output_path)


def neo4j_config() -> tuple[str, tuple[str, str]]:
    url = os.environ.get("NEO4J_URL", "neo4j://localhost:7687")
    user = os.environ.get("NEO4J_USER", os.environ.get("NEO4J_USERNAME", "neo4j"))
    password = os.environ.get("NEO4J_PASSWORD", "neo4j1234")
    return url, (user, password)


def write_terms_neo4j(terms: list[dict[str, Any]], dataset: str) -> None:
    try:
        from neo4j import GraphDatabase
    except ImportError as exc:
        raise RuntimeError("Missing dependency: install backend requirements so `neo4j` is available.") from exc

    url, auth = neo4j_config()
    driver = GraphDatabase.driver(url, auth=auth)

    with driver.session() as session:
        session.run(
            "CREATE CONSTRAINT term_dataset_key IF NOT EXISTS "
            "FOR (t:Term) REQUIRE (t.dataset, t.name_key) IS UNIQUE"
        )

        for term in terms:
            session.run(
                """
                MERGE (t:Term {dataset: $dataset, name_key: $name_key})
                SET t.name = $term,
                    t.definition = $definition,
                    t.category = $category,
                    t.source_papers = $source_papers,
                    t.pages = $pages
                """,
                dataset=dataset,
                name_key=term["name_key"],
                term=term["term"],
                definition=term["definition"],
                category=term["category"],
                source_papers=term["source_papers"],
                pages=term["pages"],
            )

        known = {term["name_key"]: term for term in terms}
        for term in terms:
            for rel in term["relations"]:
                related_key = normalize_key(rel["related_term"])
                related = known.get(related_key)
                if related is None:
                    related = {
                        "term": rel["related_term"],
                        "name_key": related_key,
                        "definition": "",
                        "category": "Other",
                        "source_papers": [],
                        "pages": [],
                    }
                    session.run(
                        """
                        MERGE (t:Term {dataset: $dataset, name_key: $name_key})
                        SET t.name = $term,
                            t.category = coalesce(t.category, $category)
                        """,
                        dataset=dataset,
                        name_key=related["name_key"],
                        term=related["term"],
                        category=related["category"],
                    )

                rel_type = safe_rel_type(rel["relation"])
                cypher = (
                    f"MATCH (a:Term {{dataset: $dataset, name_key: $source_key}}) "
                    f"MATCH (b:Term {{dataset: $dataset, name_key: $target_key}}) "
                    f"MERGE (a)-[r:`{rel_type}`]->(b) "
                    "SET r.relation = $relation"
                )
                session.run(
                    cypher,
                    dataset=dataset,
                    source_key=term["name_key"],
                    target_key=related["name_key"],
                    relation=rel["relation"],
                )

    driver.close()
    logger.info("Wrote %s terms to Neo4j dataset '%s'", len(terms), dataset)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract terms from PDFs for GPilot.")
    parser.add_argument("--pdf-dir", type=Path, default=BACKEND_DIR / "pdfs")
    parser.add_argument("--output", type=Path, default=BACKEND_DIR / "storage" / "extracted_terms.json")
    parser.add_argument(
        "--model",
        default=os.environ.get("PDF_INGEST_MODEL")
        or os.environ.get("POLYG_DEFAULT_MODEL")
        or "openai/gpt-4o-mini",
    )
    parser.add_argument("--dataset", default="papers")
    parser.add_argument("--write-neo4j", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not args.pdf_dir.is_dir():
        raise SystemExit(f"PDF directory not found: {args.pdf_dir}")

    pdfs = sorted(args.pdf_dir.glob("*.pdf"))
    if not pdfs:
        raise SystemExit(f"No PDFs found in: {args.pdf_dir}")

    merged: dict[str, ExtractedTerm] = {}
    for pdf in pdfs:
        pdf_terms = extract_pdf_terms(pdf, args.model)
        for key, term in pdf_terms.items():
            existing = merged.get(key)
            if existing is None:
                merged[key] = term
                continue
            if len(term.definition) > len(existing.definition):
                existing.definition = term.definition
            existing.source_papers.update(term.source_papers)
            existing.pages.update(term.pages)
            existing.context_snippets.extend(
                snippet for snippet in term.context_snippets if snippet not in existing.context_snippets
            )
            seen = {(rel.relation, rel.related_term) for rel in existing.relations}
            for rel in term.relations:
                if (rel.relation, rel.related_term) not in seen:
                    existing.relations.append(rel)

    terms_json = to_json_terms(merged, args.dataset)
    write_terms_json(terms_json, args.output, args.model, args.dataset)
    if args.write_neo4j:
        write_terms_neo4j(terms_json, args.dataset)


if __name__ == "__main__":
    main()
