# Graph Report - .  (2026-04-25)

## Corpus Check
- Corpus is ~6,329 words - fits in a single context window. You may not need a graph.

## Summary
- 103 nodes · 110 edges · 10 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_GraphRAG Backend Proxy|GraphRAG Backend Proxy]]
- [[_COMMUNITY_Social Icon Sprite|Social Icon Sprite]]
- [[_COMMUNITY_FastAPI Backend Endpoints|FastAPI Backend Endpoints]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_Frontend Query Workflow|Frontend Query Workflow]]
- [[_COMMUNITY_Vercel API Proxy|Vercel API Proxy]]
- [[_COMMUNITY_Robot Favicon Asset|Robot Favicon Asset]]
- [[_COMMUNITY_Hero Illustration Asset|Hero Illustration Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_Frontend Tooling Docs|Frontend Tooling Docs]]

## God Nodes (most connected - your core abstractions)
1. `PolyG GraphRAG` - 6 edges
2. `SVG Symbol Icon Sprite` - 6 edges
3. `POST /query endpoint` - 5 edges
4. `Robot Favicon` - 5 edges
5. `Isometric Layered Illustration` - 5 edges
6. `Purple Lower Platform` - 5 edges
7. `Vite Logo` - 5 edges
8. `handler()` - 4 edges
9. `React Vite frontend` - 4 edges
10. `GPilot FastAPI app` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Lucide dependency optimization` --conceptually_related_to--> `React Vite frontend`  [INFERRED]
  gpilot-web/vite.config.ts → README.md
- `Vite development API proxy` --references--> `GPilot API contract`  [EXTRACTED]
  gpilot-web/vite.config.ts → README.md
- `GraphRAG instance cache` --calls--> `PolyG GraphRAG`  [EXTRACTED]
  backend/main.py → README.md
- `React Vite frontend` --references--> `Vite development API proxy`  [EXTRACTED]
  README.md → gpilot-web/vite.config.ts
- `Backend CORS configuration` --rationale_for--> `React Vite frontend`  [EXTRACTED]
  backend/main.py → README.md

## Hyperedges (group relationships)
- **GPilot Architecture Stack** — readme_react_frontend, readme_fastapi_backend, readme_polygrag, readme_neo4j, readme_model_apis [EXTRACTED 1.00]
- **Query Request Flow** — app_send_message, vite_dev_proxy, path_vercel_proxy, main_query_endpoint, main_graphrag_cache [INFERRED 0.82]
- **Frontend Bootstrap Flow** — index_html_shell, main_react_entry, app_chat_state [EXTRACTED 1.00]
- **Robot Symbol Components** — favicon_robot_favicon, favicon_teal_line_art_style, favicon_rounded_robot_head, favicon_top_antenna, favicon_side_connectors, favicon_facial_marks [EXTRACTED 1.00]
- **Symbols Form Shared SVG Icon Sprite** — icons_bluesky_icon, icons_discord_icon, icons_documentation_icon, icons_github_icon, icons_social_icon, icons_x_icon [EXTRACTED 1.00]
- **Social Brand Logo Icons** — icons_bluesky_icon, icons_discord_icon, icons_github_icon, icons_x_icon [INFERRED 0.85]
- **Layered Stack Form** — hero_upper_platform, hero_lower_platform, hero_alignment_guides [EXTRACTED 1.00]
- **Vite Logo Visual Components** — vite_lightning_mark, vite_parentheses_frame, vite_masked_highlights [EXTRACTED 1.00]

## Communities

### Community 0 - "GraphRAG Backend Proxy"
Cohesion: 0.15
Nodes (17): Backend CORS configuration, GPilot FastAPI app, GraphRAG instance cache, Default GraphRAG warmup, BACKEND_ORIGIN resolver, Hop-by-hop header filtering, Vercel catch-all API proxy, FastAPI backend (+9 more)

### Community 1 - "Social Icon Sprite"
Cohesion: 0.18
Nodes (15): Bluesky Butterfly Logo Icon, Bluesky Platform, Discord Controller Face Logo Icon, Discord Platform, Documentation Document And Code Brackets Icon, Documentation UI Destination, GitHub Octocat Logo Icon, GitHub Platform (+7 more)

### Community 2 - "FastAPI Backend Endpoints"
Cohesion: 0.25
Nodes (9): BaseModel, get_rag(), lifespan(), list_datasets(), query(), QueryRequest, QueryResponse, GPilot Backend — FastAPI server that wraps PolyG's GraphRAG engine.  Run from th (+1 more)

### Community 3 - "Vite Logo Asset"
Cohesion: 0.24
Nodes (10): Accessible Title: Vite, Alpha Mask, Gaussian Blur Filters, Build Tool Branding Role, Dark Mode Parenthesis Style, Purple Vite Lightning Mark, Masked Gradient Highlights, Responsive Parentheses Frame (+2 more)

### Community 4 - "Frontend Query Workflow"
Cohesion: 0.28
Nodes (9): Frontend chat state, Selected dataset workflow, Send message workflow, HTML root shell, Dataset ID mapping, POST /query endpoint, PolyG query parameters, React root entrypoint (+1 more)

### Community 5 - "Vercel API Proxy"
Cohesion: 0.6
Nodes (5): buildHeaders(), buildRequestBody(), buildTargetUrl(), getBackendOrigin(), handler()

### Community 6 - "Robot Favicon Asset"
Cohesion: 0.33
Nodes (6): Robot Facial Marks, Robot Favicon, Rounded Robot Head, Side Connectors, Teal Line Art Style, Top Antenna

### Community 7 - "Hero Illustration Asset"
Cohesion: 0.67
Nodes (6): Dashed Alignment Guides, Central White Panel, Isometric Layered Illustration, Purple Lower Platform, Purple Edge Glow, Floating Upper Platform

### Community 8 - "React Logo Asset"
Cohesion: 0.4
Nodes (5): App Brand Asset, Iconify Logos Class, Image Role, React Logo, React SVG Asset

### Community 13 - "Frontend Tooling Docs"
Cohesion: 1.0
Nodes (2): Frontend ESLint flat config, React TypeScript Vite template guidance

## Knowledge Gaps
- **29 isolated node(s):** `GPilot Backend — FastAPI server that wraps PolyG's GraphRAG engine.  Run from th`, `Return which PolyG datasets are available on disk.`, `GPilot`, `OpenAI and DeepSeek APIs`, `PolyG query parameters` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Frontend Tooling Docs`** (2 nodes): `Frontend ESLint flat config`, `React TypeScript Vite template guidance`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Vite development API proxy` connect `GraphRAG Backend Proxy` to `Frontend Query Workflow`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `GPilot Backend — FastAPI server that wraps PolyG's GraphRAG engine.  Run from th`, `Return which PolyG datasets are available on disk.`, `GPilot` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._