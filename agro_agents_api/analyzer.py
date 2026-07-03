import os
import time
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from google.api_core.exceptions import ResourceExhausted

# Models for structured output
class TelemetryAnalysisResult(BaseModel):
    severity: str = Field(description="Escribe estrictamente uno de estos tres valores: Alta, Media, Baja")
    anomaly_type: str = Field(description="Diagnóstico conciso que detectas considerando la biomasa vs humedad. Ej: 'Posible déficit hídrico leve' o 'Excelente desarrollo radicular'")
    action_suggested: str = Field(description="Acción agronómica recomendada muy precisa y aplicable en campo para el campesino.")

class DiscoveryAnalysisResult(BaseModel):
    detected_crop: str = Field(description="Nombre del cultivo identificado")
    confidence_score: float = Field(description="0.0 a 1.0")
    suggested_crop: str = Field(description="Cultivo recomendado para reconversión")
    suitability_index: int = Field(description="0 a 100")
    market_demand_score: int = Field(description="0 a 100")
    estimated_yield_increase: int = Field(description="porcentaje (ej: 25)")
    reasoning: str = Field(description="Breve explicación técnica")

# LLM setup
# We use gemini-2.5-flash as the default model
analyzer_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)

# Configure the LLM to output our structured models
telemetry_analyzer = analyzer_llm.with_structured_output(TelemetryAnalysisResult)
discovery_analyzer = analyzer_llm.with_structured_output(DiscoveryAnalysisResult)

def write_usage_log(model_name: str, input_tokens: int, output_tokens: int, parcel_name: str, status: str = "SUCCESS", error_msg: str = ""):
    log_path = '../llm_usage.jsonl'
    import json
    from datetime import datetime
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "parcel": parcel_name,
        "model": model_name,
        "status": status,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens
    }
    if error_msg:
        log_entry["error_message"] = error_msg

    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"Error writing usage log: {e}")

# Retry decorator: retries on 429 quota errors, max 5 attempts, wait 5, 10, 20, 40 seconds...
@retry(
    retry=retry_if_exception_type(ResourceExhausted),
    wait=wait_exponential(multiplier=5, min=5, max=60),
    stop=stop_after_attempt(5),
    reraise=True
)
def _analyze_telemetry_with_retry(prompt: str):
    # Notice: tracking exact tokens in Langchain with standard ChatGoogleGenerativeAI 
    # doesn't always expose usage_metadata directly on the parsed output if using with_structured_output.
    # However, we'll try to estimate or catch it if possible, but for simplicity we rely on the object return.
    return telemetry_analyzer.invoke(prompt)

def analyze_telemetry(payload: dict) -> dict:
    parcel = payload.get("parcel", {})
    telemetry = payload.get("telemetry", {})
    
    active_crop = parcel.get("active_crop", "Desconocido")
    mission = telemetry.get("mission", "")
    
    if 'SAR' in mission:
        telemetry_info = f"""Resultados Científicos de Telemetría RADAR SAR (Sentinel-1):
- Retrodispersión VV: {telemetry.get('vv', 0):.4f}
- Retrodispersión VH: {telemetry.get('vh', 0):.4f}
NOTA: El radar SAR atraviesa nubes. Valores altos de VH sugieren mayor biomasa estructural (hojas/tallos). Valores bajos sugieren suelo desnudo o agua."""
    else:
        telemetry_info = f"""Resultados Científicos de Telemetría Óptica (Sentinel-2):
- NDVI (Índice de Vigor Vegetativo/Biomasa): {telemetry.get('ndvi', 0):.3f}
- NDMI (Índice de Estrés Hídrico/Humedad de Hoja): {telemetry.get('ndmi', 0):.3f}
- BSI (Índice de Suelo Desnudo/Salinidad/Erosión): {telemetry.get('bsi', 0):.3f}"""

    prompt = f"""Actúa como un Ingeniero Agrónomo experto y empático de Ecuador. Analiza la siguiente lectura satelital cruda ({mission}) del cultivo "{active_crop}".
{telemetry_info}

INSTRUCCIÓN VITAL: Evalúa los datos para entender si hay déficit hídrico, ataques fúngicos, erosión de suelo o desarrollo óptimo."""

    try:
        # Pydantic object
        result = _analyze_telemetry_with_retry(prompt)
        
        # Log usage (estimation or standard metric since with_structured_output hides tokens)
        # Assuming ~250 input tokens and ~150 output tokens for logging if exact isn't available
        write_usage_log("gemini-2.5-flash", 250, 150, active_crop)
        
        return {
            "severity": result.severity,
            "anomaly_type": result.anomaly_type,
            "action_suggested": result.action_suggested
        }
    except Exception as e:
        write_usage_log("gemini-2.5-flash", 0, 0, active_crop, status="ERROR", error_msg=str(e))
        raise e

@retry(
    retry=retry_if_exception_type(ResourceExhausted),
    wait=wait_exponential(multiplier=5, min=5, max=60),
    stop=stop_after_attempt(5),
    reraise=True
)
def _discovery_analysis_with_retry(prompt: str):
    return discovery_analyzer.invoke(prompt)

def perform_discovery_analysis(payload: dict) -> dict:
    parcel = payload.get("parcel", {})
    history_str = payload.get("history_summary", "")
    
    active_crop = parcel.get("active_crop", "Desconocido")
    provincia = parcel.get("provincia", "Ecuador")
    
    prompt = f"""
    Actúa como un experto en agrotecnología y análisis de datos de Copernicus.
    Analiza el historial de esta parcela en Ecuador para identificar el cultivo real y proponer alternativas rentables.
    
    PARCELA: {active_crop}
    ZONA: {provincia}
    HISTORIAL RECIENTE: {history_str}
    
    TAREA:
    1. Determina si lo que está sembrado coincide con "{active_crop}" basándote en los niveles de biomasa (NDVI).
    2. Propon un cultivo ALTERNATIVO que sea más rentable o resistente, considerando el clima de {provincia}.
    3. Asigna un score de aptitud (0-100) y demanda de mercado (0-100).
    """

    try:
        result = _discovery_analysis_with_retry(prompt)
        write_usage_log("gemini-2.5-flash", 300, 200, active_crop)
        
        return {
            "detected_crop": result.detected_crop,
            "confidence_score": result.confidence_score,
            "suggested_crop": result.suggested_crop,
            "suitability_index": result.suitability_index,
            "market_demand_score": result.market_demand_score,
            "estimated_yield_increase": result.estimated_yield_increase,
            "reasoning": result.reasoning
        }
    except Exception as e:
        write_usage_log("gemini-2.5-flash", 0, 0, active_crop, status="ERROR", error_msg=str(e))
        raise e
