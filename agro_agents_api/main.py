import os
import json
from fastapi import FastAPI, Request
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, message_to_dict, messages_from_dict
from graph import graph
from tools import supabase
from analyzer import analyze_telemetry, perform_discovery_analysis
from batch_analyzer_endpoint import router as batch_router
from eudr_processor import process_eudr_validation


app = FastAPI(title="AgroConecta AI Agents API", version="1.0.0")
app.include_router(batch_router)

class ChatRequest(BaseModel):
    phone: str
    message: str
    image_url: str | None = None

def get_state(thread_id: str) -> dict:
    try:
        response = supabase.table('agent_memory_state').select('state').eq('thread_id', thread_id).execute()
        if response.data:
            return response.data[0]['state']
        return {"messages": []}
    except Exception as e:
        print(f"Error fetching state: {e}")
        return {"messages": []}

def save_state(thread_id: str, state: dict):
    # Langchain messages are objects, we need to serialize them for JSONB
    # state['messages'] is a tuple or list of BaseMessage
    serialized_messages = [message_to_dict(m) for m in state["messages"]]
    serializable_state = {"messages": serialized_messages}
    
    try:
        supabase.table('agent_memory_state').upsert({
            'thread_id': thread_id,
            'state': serializable_state
        }).execute()
    except Exception as e:
        print(f"Error saving state: {e}")

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(req: ChatRequest):
    """
    Endpoint consumido por n8n o Twilio para interacciones vía WhatsApp.
    """
    thread_id = req.phone
    user_message = req.message

    # 1. Fetch existing state from Supabase
    db_state = get_state(thread_id)
    
    # Deserialize messages
    if "messages" in db_state and len(db_state["messages"]) > 0:
        messages = messages_from_dict(db_state["messages"])
    else:
        messages = []

    # 2. Append new user message
    if req.image_url:
        msg_content = [
            {"type": "text", "text": user_message},
            {"type": "image_url", "image_url": req.image_url}
        ]
        messages.append(HumanMessage(content=msg_content))
    else:
        messages.append(HumanMessage(content=user_message))
    
    current_state = {"messages": messages}

    # 3. Invoke Graph
    final_state = graph.invoke(current_state)
    
    # 4. Extract last AI message
    last_message = final_state["messages"][-1]
    reply_text = last_message.content if isinstance(last_message, AIMessage) else str(last_message)
    
    # 5. Save new state
    save_state(thread_id, final_state)

    # 6. Return response to n8n
    return {
        "success": True,
        "reply": reply_text
    }

@app.post("/api/chat")
async def portal_chat(req: ChatRequest):
    """
    Endpoint consumido por el portal React de AgroConecta.
    (Utiliza la misma lógica, pero podría extenderse para recibir parcel_id)
    """
    # Para la web, podríamos usar el ID de usuario como thread_id
    return await whatsapp_webhook(req)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/analyze_telemetry")
async def api_analyze_telemetry(req: Request):
    """
    Endpoint consumido por el Worker de Copernicus para analizar telemetría.
    """
    payload = await req.json()
    return analyze_telemetry(payload)

@app.post("/api/discovery_analysis")
async def api_discovery_analysis(req: Request):
    """
    Endpoint consumido por el Worker de Copernicus para análisis predictivo y de reconversión.
    """
    payload = await req.json()
    return perform_discovery_analysis(payload)

@app.post("/api/eudr/validate/{parcel_id}")
async def api_validate_eudr(parcel_id: str):
    """
    Endpoint para ejecutar el pipeline de validación espacial de EUDR para una finca.
    """
    return process_eudr_validation(parcel_id)

@app.get("/api/eudr/export/{parcel_id}")
async def api_export_traces_geojson(parcel_id: str):
    """
    Endpoint para descargar el GeoJSON estructurado de TRACES NT para la aduana.
    """
    try:
        res = supabase.table('parcels').select('traces_nt_geojson').eq('id', parcel_id).execute()
        if res.data and res.data[0].get('traces_nt_geojson'):
            return res.data[0]['traces_nt_geojson']
        return {"error": "GeoJSON de exportación no disponible o la parcela no ha sido validada."}
    except Exception as e:
        return {"error": str(e)}

