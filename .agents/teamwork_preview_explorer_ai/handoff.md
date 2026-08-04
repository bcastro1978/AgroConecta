# Technical Audit Handoff Report: Python AI Agents Microservice

This report presents a functional and conceptual technical audit of the Python AI agents microservice (`agro_agents_api/`) of the AgroConecta project, comparing the codebase implementation against the specifications in the Obsidian vault (`docs/AgroConecta/`).

---

## 1. Observations

Direct code and documentation observations supporting the audit:

### A. FastAPI Entrypoint (`agro_agents_api/main.py`)
* **WhatsApp Chat Endpoint Input & Memory Persistence (Lines 16-18, 20-43):**
  ```python
  class ChatRequest(BaseModel):
      phone: str
      message: str
  ```
  The endpoint utilizes Supabase client to fetch state from the `agent_memory_state` table:
  ```python
  response = supabase.table('agent_memory_state').select('state').eq('thread_id', thread_id).execute()
  ```
  And saves state back with LangChain serialization:
  ```python
  serialized_messages = [message_to_dict(m) for m in state["messages"]]
  supabase.table('agent_memory_state').upsert({'thread_id': thread_id, 'state': serializable_state}).execute()
  ```

### B. LangGraph Ecosistema (`agro_agents_api/graph.py`)
* **Supervisor Routing and Tools (Lines 27-38):**
  Uses `gemini-2.5-flash` with structured routing binding `Route`:
  ```python
  class Route(BaseModel):
      next_node: Literal["meteorologist", "irrigation_specialist", "nutritional_specialist", "pest_specialist", "harvest_coordinator", "economic_analyst"]
  ```
* **Pest Specialist Prompt VS Payload (Lines 88-94):**
  The prompt directs the agent to evaluate photo uploads:
  ```python
  If the user sends a PHOTO (image) of a sick crop/soil:
  1. Visually analyze the image to identify pathogens...
  ```
  However, the `ChatRequest` model in `main.py` only takes `phone` and `message` as strings. There is no parameter or handler to receive image files or URLs and pass them to the LLM.

### C. Batch B2B Matchmaking (`agro_agents_api/batch_analyzer_endpoint.py`)
* **MQL Generation (Lines 27-77):**
  Endpoint `/api/batch_analyze_b2b` processes parcel telemetry array and matches a commercial need category. It returns the result in JSON:
  ```python
  return {"leads": results}
  ```
  There is no database call (e.g., to `agricultural_leads` or `b2b_smart_leads`) to save these leads in Supabase.

### D. EUDR Spatial Validation Pipeline (`agro_agents_api/eudr_processor.py`)
* **Spatial Audits (Lines 111-205):**
  Implements 5 core geometric verification rules:
  * *Rule 1:* Area > 4.0 ha requires a polygon, not a point.
  * *Rule 2:* Coordinate precision check (requires >= 6 decimal places).
  * *Rule 3:* Bounding Box cap at 1000 ha to prevent giant administrative box uploads.
  * *Rule 4:* MultiPolygon split distance cap of 500 meters.
  * *Rule 5:* Topological repair using `make_valid` / `buffer(0)` and overlap checks against existing DB geometries.
* **GFW API Integration & Offline Fallback (Lines 207-363):**
  Makes a live HTTP request to Global Forest Watch:
  ```python
  GFW_API_URL = "https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query"
  ```
  If GFW API fails, it catches exceptions and runs `_fallback_deforestation_check()` against hardcoded Ecuadorian deforestation hot-zones (Esmeraldas, Sucumbíos, Orellana, Morona Santiago).
* **Database Save & Export (Lines 474-490):**
  Writes EU-compliant TRACES NT GeoJSON structure back to Supabase:
  ```python
  supabase.table('parcels').update(update_data).eq('id', parcel_id).execute()
  ```

### E. Deno Edge Functions (`supabase/functions/`)
* **`sync-single-parcel/index.ts` (Lines 194-211):**
  Directly triggers a fallback water stress alert if NDMI is low, bypassing the FastAPI service:
  ```typescript
  if (telemetryResult.ndmi < -0.1) {
      waterAlert = { severity: 'Alta', anomaly_type: 'WATER_STRESS...', ... }
  }
  ```
* **`start-territorial-analysis/index.ts` (Lines 27-41):**
  The edge function has all of its core multi-agent orchestration logic commented out. It returns a mock success message immediately:
  ```typescript
  return new Response(JSON.stringify({ message: 'Analysis started asynchronously.' }))
  ```

### F. Cron & Frontend LLM Integrations
* **`run_cron.js` (Lines 78, 177-188):**
  A Node.js script. Hardcoded to select cacao crop only (`active_crop: 'CACAO'`). It queries CDSE statistics and executes direct fetch calls to `generativelanguage.googleapis.com` (Gemini API) using client fetch, bypassing the FastAPI service.
* **`src/lib/agriExpertAI.ts` (Lines 1-51):**
  A client-side utility doing a raw POST to Gemini to get JSON agronomic advice.

### G. n8n & WhatsApp Integrations (`.agents/workflows/copernicus/`)
* **`n8n_agronomic_alert_workflow.json` & `Agronomic_Translator_Agent.md`:**
  A mock workflow template and markdown description of webhooks targeting `http://localhost:5680/`. No runtime code triggers actual webhook requests in the FastAPI microservice.

---

## 2. Logic Chain

1. **Memory Persistence:** Since `Agente_IA_LangGraph.md` specifies saving conversation history in Supabase using phone numbers, and `main.py` explicitly fetches/upserts state matching `thread_id = req.phone` using `message_to_dict` serialization in the `agent_memory_state` table, **conversation memory is fully operational**.
2. **Specialist Agents & Tools:** Since `graph.py` implements the StateGraph, routes with `Route` schema arguments, binds `get_parcel_info`, `get_latest_copernicus_telemetry`, and `get_b2b_providers` to LLMs, and invokes database tools in `tools.py` successfully, **routing, core specialist nodes, and tool execution are fully operational**.
3. **Pest Specialist Vision:** Since the system prompt under `graph.py` requests visual analysis of photo uploads, but the `ChatRequest` model in `main.py` has no image URL/file inputs and does not pass anything but text strings to LangGraph, **image diagnostic vision is inoperative**.
4. **B2B Lead Database Persistence:** Since `Modulo_Leads_B2B.md` specifies writing generated MQL leads to database tables, but `/api/batch_analyze_b2b` in `batch_analyzer_endpoint.py` only constructs a return response without writing to Supabase, **B2B lead generation is only partially operational (mock-only on database persistence)**.
5. **Sentinel-1 SAR Switching:** Since the workflow specifies switching to Sentinel-1 SAR if cloud coverage is > 20%, but the Deno function `sync-single-parcel/index.ts` and `run_cron.js` filter for Sentinel-2 only and throw errors when cloudy, **SAR sensor switching is missing from the data fetchers** (though the LLM analysis logic in `analyzer.py` is ready to handle SAR metrics).
6. **Territorial Analysis Orchestration:** Since the edge function `start-territorial-analysis` has its pipeline logic commented out and only returns a text stub, **territorial multi-agent analysis is mock-only/inoperative**.
7. **EUDR Spatial Compliance:** Since `eudr_processor.py` implements the 5 spatial validation rules, connects to the GFW API, implements a local hot-spot backup check, structures TRACES NT GeoJSON output, and writes results to the `parcels` table in Supabase, **EUDR validation is fully operational**, exceeding the "roadmap" status described in `Modulo_Trazabilidad_EUDR.md`.
8. **WhatsApp/n8n Webhook Integration:** Since the n8n template exists in `.agents/` as static metadata, but no actual HTTP requests to n8n are triggered in the active Python or Node codebases, **webhook triggering is mock-only**.

---

## 3. Caveats

* **CDSE / Supabase Credentials:** The exact `.env` file credentials could not be read during the audit due to a read file permission timeout. It is assumed valid configurations exist, as `main.py` and `tools.py` successfully initialize these clients.
* **API Rate Limits:** The use of `gemini-2.5-flash` in the free tier can easily exhaust quotas during batch cron runs. While retry logic via `tenacity` is present in Python, Node.js scripts (`run_cron.js` / `agriExpertAI.ts`) lack exponential backoff handlers.
* **Geospatial Proximity:** Proximity checking (`parcel_geometry VS coverage_area`) specified in `Marketplace_Matchmaker.md` is not present in the Python tools.

---

## 4. Conclusions

The Python AI agents microservice exhibits a high degree of implementation in core conversational routing (LangGraph), spatial validation (EUDR), and unstructured telemetry analysis. However, there are architectural gaps where components are bypassed, mocked, or missing database persistence:

1. **Bypasses:** The React client (`agriExpertAI.ts`) and Node cron (`run_cron.js`) bypass the FastAPI agents microservice, calling the Gemini API directly.
2. **Mocks:** The `start-territorial-analysis` Edge Function is a placeholder, and n8n webhooks are template-only.
3. **Missing Features:**
   * Image file upload/vision parsing in `/webhook/whatsapp` and `pest_specialist`.
   * DB write operations in `/api/batch_analyze_b2b` (should write to `agricultural_leads` or `b2b_smart_leads`).
   * Dynamic switching to Sentinel-1 SAR in data fetchers (`sync-single-parcel` / `run_cron.js`) when cloud coverage is high.

---

## 5. Verification Method

To independently verify the microservice functionality:

1. **FastAPI Server Launch:**
   Run the following commands inside `agro_agents_api` directory to start the server:
   ```bash
   uvicorn main:app --port 8000
   ```
2. **Interactive Webhook Test (whatsapp):**
   Send a POST request to `http://127.0.0.1:8000/webhook/whatsapp` with:
   ```json
   {
     "phone": "+593999999999",
     "message": "Hola, necesito saber si mi parcela de cacao con ID: c3a4b5c6... tiene problemas de riego."
   }
   ```
   Check if it returns a structured reply and saves the thread in the `agent_memory_state` table of the Supabase database.
3. **B2B Batch Matchmaker API Check:**
   Send a POST request to `http://127.0.0.1:8000/api/batch_analyze_b2b` with a parcel and telemetry payload to verify the JSON output structure. Verify that no records are added to `agricultural_leads`.
4. **EUDR Spatial Validation Check:**
   Send a POST request to `http://127.0.0.1:8000/api/eudr/validate/{parcel_id}` using a test parcel ID. Verify if fields `eudr_status`, `is_deforestation_free`, `eudr_validation_details`, and `traces_nt_geojson` are successfully updated in the Supabase database.
