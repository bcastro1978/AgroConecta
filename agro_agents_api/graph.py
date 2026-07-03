import os
from typing import Annotated, Sequence, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from tools import get_parcel_info, get_latest_copernicus_telemetry, get_b2b_providers

# Define State
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    next_node: str

# Instantiate models
supervisor_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0) # Note: Using flash instead of pro due to free tier quota limits
# Using standard model string, the SDK will pass it to the API.
try:
    supervisor_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
    worker_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
except Exception:
    pass # fallback handled by SDK

# Tool Nodes
supervisor_tools = [get_parcel_info, get_latest_copernicus_telemetry]
supervisor_tool_node = ToolNode(supervisor_tools)

economic_tools = [get_b2b_providers]
economic_tool_node = ToolNode(economic_tools)

class Route(BaseModel):
    next_node: Literal["meteorologist", "irrigation_specialist", "nutritional_specialist", "pest_specialist", "harvest_coordinator", "economic_analyst"] = Field(
        ..., description="The next agent to route to. DO NOT call this tool if the user's query is fully answered or if you can answer it directly."
    )

supervisor_llm_with_tools = supervisor_llm.bind_tools(supervisor_tools + [Route])

def supervisor_node(state: AgentState):
    messages = state["messages"]
    system_message = SystemMessage(content="""Eres el Coordinador General de AgroConecta. 
Recibes mensajes de agricultores vía WhatsApp. 
Tu objetivo:
1. Extraer la intención y los datos de la parcela (ej. ID de parcela o nombre de cultivo).
2. Si es necesario, usar las herramientas para buscar información de la parcela y su última telemetría satelital Copernicus.
3. Si el agricultor hace una pregunta general que no requiere un especialista, respóndele directamente y llama a FINISH.
4. Si la consulta requiere análisis específico (riego, nutrición, plagas, clima, economía, cosecha), debes ENRUTAR al especialista adecuado usando la herramienta Route, PROVEYENDO todo el contexto satelital que obtuviste.
5. NO inventes datos. Usa las herramientas.""")
    
    response = supervisor_llm_with_tools.invoke([system_message] + list(messages))
    
    # Check if a tool was called
    if response.tool_calls:
        # Check if it called the routing tool
        for tc in response.tool_calls:
            if tc["name"] == "Route":
                # We extract the routing decision but don't add the tool call to messages to avoid tool execution errors for Route
                return {"next_node": tc["args"]["next_node"]}
        
        # If it called other tools (like get_parcel_info)
        return {"messages": [response], "next_node": "supervisor_tools"}
    
    # If no tools called, it means it answered directly
    return {"messages": [response], "next_node": "FINISH"}


# Workers
def worker_node(state: AgentState, role_prompt: str, name: str):
    messages = state["messages"]
    system_message = SystemMessage(content=role_prompt)
    response = worker_llm.invoke([system_message] + list(messages))
    return {"messages": [AIMessage(content=response.content, name=name)], "next_node": "FINISH"}

def meteorologist(state: AgentState):
    prompt = "Eres el Meteorólogo Virtual de AgroConecta. Analiza los datos climáticos provistos por el Coordinador y da una recomendación simple y amigable al agricultor."
    return worker_node(state, prompt, "meteorologist")

def irrigation_specialist(state: AgentState):
    prompt = "Eres el Especialista en Riego de AgroConecta. Analiza el NDMI (Humedad) provisto en la telemetría satelital por el Coordinador. Si es menor a 0.4, hay déficit hídrico. Recomienda acciones prácticas de riego."
    return worker_node(state, prompt, "irrigation_specialist")

def nutritional_specialist(state: AgentState):
    prompt = "Eres el Especialista Nutricional de AgroConecta. Analiza el NDVI (Biomasa) de la telemetría. Si NDVI es bajo, sugiere aplicación de fertilizantes. Da consejos claros y al grano."
    return worker_node(state, prompt, "nutritional_specialist")

def pest_specialist(state: AgentState):
    prompt = """Eres un experto Fitopatólogo Ecuatoriano.
Si el usuario envía una FOTO (imagen) de un cultivo o suelo enfermo:
1. Analiza visualmente la imagen para identificar patógenos, deficiencias nutricionales o plagas (ej. paratrioza, gusano blanco, mancha de asfalto).
2. Responde con un pre-diagnóstico y tu nivel de confianza.
3. Brinda recomendaciones usando un enfoque de Manejo Integrado de Plagas (MIP), priorizando bioinsumos y métodos orgánicos.

Si el usuario envía texto con datos satelitales (alta humedad, caída abrupta de biomasa/NDVI), alerta sobre el riesgo inminente de hongos o plagas y da recomendaciones preventivas. Sé empático y claro."""
    return worker_node(state, prompt, "pest_specialist")

def harvest_coordinator(state: AgentState):
    prompt = "Eres el Coordinador de Cosecha. Asesora sobre el mejor momento para cosechar según el estado fenológico y la información satelital."
    return worker_node(state, prompt, "harvest_coordinator")

economic_llm_with_tools = worker_llm.bind_tools(economic_tools)

def economic_analyst(state: AgentState):
    # This one might use tools
    messages = state["messages"]
    prompt = "Eres el Analista Económico. Si el productor necesita insumos o maquinaria, usa la herramienta para buscar proveedores B2B y dales el contacto."
    system_message = SystemMessage(content=prompt)
    response = economic_llm_with_tools.invoke([system_message] + list(messages))
    
    if response.tool_calls:
        return {"messages": [response], "next_node": "economic_tools"}
    return {"messages": [AIMessage(content=response.content, name="economic_analyst")], "next_node": "FINISH"}

# Routing functions
def router(state: AgentState):
    return state.get("next_node", "FINISH")

# Build Graph
builder = StateGraph(AgentState)

builder.add_node("supervisor", supervisor_node)
builder.add_node("supervisor_tools", supervisor_tool_node)
builder.add_node("meteorologist", meteorologist)
builder.add_node("irrigation_specialist", irrigation_specialist)
builder.add_node("nutritional_specialist", nutritional_specialist)
builder.add_node("pest_specialist", pest_specialist)
builder.add_node("harvest_coordinator", harvest_coordinator)
builder.add_node("economic_analyst", economic_analyst)
builder.add_node("economic_tools", economic_tool_node)

builder.add_edge(START, "supervisor")

builder.add_conditional_edges(
    "supervisor",
    router,
    {
        "supervisor_tools": "supervisor_tools",
        "meteorologist": "meteorologist",
        "irrigation_specialist": "irrigation_specialist",
        "nutritional_specialist": "nutritional_specialist",
        "pest_specialist": "pest_specialist",
        "harvest_coordinator": "harvest_coordinator",
        "economic_analyst": "economic_analyst",
        "FINISH": END
    }
)

# After supervisor tools execute, go back to supervisor
builder.add_edge("supervisor_tools", "supervisor")

# After workers execute, they finish (for this linear interaction model)
builder.add_edge("meteorologist", END)
builder.add_edge("irrigation_specialist", END)
builder.add_edge("nutritional_specialist", END)
builder.add_edge("pest_specialist", END)
builder.add_edge("harvest_coordinator", END)

# Economic routing
builder.add_conditional_edges(
    "economic_analyst",
    router,
    {
        "economic_tools": "economic_tools",
        "FINISH": END
    }
)
builder.add_edge("economic_tools", "economic_analyst")

graph = builder.compile()
