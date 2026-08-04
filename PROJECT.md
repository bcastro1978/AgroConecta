# Project: AgroConecta Technical Audit

## Architecture
The AgroConecta platform consists of three main tiers:
- **React Frontend**: Single Page Application (SPA) using React 19, Vite, Tailwind CSS v4, and Leaflet for geospatial visualization.
- **Supabase Backend**: BaaS utilizing PostgreSQL, Row Level Security (RLS) for multi-tenant isolation (Producers vs. Providers), and Deno-based Edge Functions.
- **Python AI Agents**: Microservice using FastAPI, LangGraph, and Gemini 2.5 Flash for agricultural diagnostics, satellite NDMI analysis, B2B matchmaking, and WhatsApp/n8n integration.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Frontend Audit | Investigate React SPA source code, page structure, hooks, Leaflet integrations, and mock data vs. Obsidian specifications. | None | DONE (a23c9ef7-7083-4f2e-ab99-95ad763bf4d5) |
| 2 | Backend & DB Audit | Investigate PostgreSQL schema, RLS policies, migrations, and Deno edge functions vs. specifications. | None | DONE (fffd0f48-661e-4f8b-81b3-7259c494d4b9) |
| 3 | AI Agents & Python API Audit | Investigate FastAPI microservice, LangGraph conversation flow, tools, Gemini integrations, and memory persistence vs. specifications. | None | DONE (88687c8d-74cc-4b41-af56-75fcf02cf33e) |
| 4 | Audit Report Synthesis | Synthesize all findings and write `reporte_auditoria_agroconecta.md` at the project root. | M1, M2, M3 | DONE |

## Code Layout
- Frontend: `src/`
- Backend: `supabase/`
- AI Agents: `agro_agents_api/`
- Documentation: `docs/AgroConecta/`
