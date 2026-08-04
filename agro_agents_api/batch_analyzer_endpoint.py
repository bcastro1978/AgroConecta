import os
from fastapi import APIRouter, Request
from analyzer import analyzer_llm, write_usage_log
from tools import supabase
from pydantic import BaseModel, Field
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from google.api_core.exceptions import ResourceExhausted

router = APIRouter()

class B2BLeadResult(BaseModel):
    category_match: str = Field(description="Categoría de producto/servicio sugerida. Ej: Insumos, Maquinaria, Riego, Asesoría, Financiamiento")
    severity: str = Field(description="Alta, Media o Baja")
    diagnosis_summary: str = Field(description="Resumen técnico del hallazgo para el proveedor. Ej: Déficit hídrico severo detectado mediante NDMI bajo.")
    pre_score: int = Field(description="Puntuación del lead del 0 al 100")

lead_generator = analyzer_llm.with_structured_output(B2BLeadResult)

@retry(
    retry=retry_if_exception_type(ResourceExhausted),
    wait=wait_exponential(multiplier=5, min=5, max=60),
    stop=stop_after_attempt(5),
    reraise=True
)
def _generate_b2b_lead_with_retry(prompt: str):
    return lead_generator.invoke(prompt)

@router.post("/api/batch_analyze_b2b")
async def api_batch_analyze_b2b(req: Request):
    """
    Recibe un array de parcelas con su telemetría.
    Devuelve los leads B2B generados.
    """
    payload = await req.json()
    parcels_data = payload.get("data", [])
    
    results = []
    
    for item in parcels_data:
        parcel = item.get("parcel", {})
        telemetry = item.get("telemetry", {})
        
        active_crop = parcel.get("active_crop", "Desconocido")
        mission = telemetry.get("mission", "Sentinel-2")
        
        if 'SAR' in mission:
            telemetry_info = f"RADAR SAR - VV: {telemetry.get('vv', 0):.4f}, VH: {telemetry.get('vh', 0):.4f}"
        else:
            telemetry_info = f"OPTICO - NDVI: {telemetry.get('ndvi', 0):.3f}, NDMI: {telemetry.get('ndmi', 0):.3f}, BSI: {telemetry.get('bsi', 0):.3f}"

        prompt = f"""
        Eres el Agente Comercial B2B de AgroConecta.
        Analiza estos datos satelitales crudos para el cultivo de {active_crop}.
        {telemetry_info}
        
        Determina qué tipo de proveedor agrícola podría solucionar el problema actual de esta parcela 
        (ej. si NDMI es bajo, se necesita Riego. Si NDVI es muy bajo, se necesita Fertilizantes/Insumos).
        """
        
        try:
            res = _generate_b2b_lead_with_retry(prompt)
            write_usage_log("gemini-2.5-flash", 200, 100, active_crop)
            
            results.append({
                "parcel_id": parcel.get("id"),
                "category_match": res.category_match,
                "severity": res.severity,
                "diagnosis_summary": res.diagnosis_summary,
                "pre_score": res.pre_score,
                "province": parcel.get("provincia"),
                "parish": parcel.get("parroquia"),
                "crop_type": active_crop,
                "geometry": parcel.get("geometry")
            })
            
            # Persist lead to database
            if res.severity in ['Media', 'Alta']:
                try:
                    # Buscamos proveedor de esa categoría
                    prov_res = supabase.table('b2b_providers').select('id').eq('category', res.category_match).limit(1).execute()
                    if prov_res.data:
                        provider_id = prov_res.data[0]['id']
                        supabase.table('b2b_smart_leads').insert({
                            "provider_id": provider_id,
                            "parcel_id": parcel.get("id"),
                            "category_match": res.category_match,
                            "pre_score": res.pre_score,
                            "status": 'New'
                        }).execute()
                except Exception as e:
                    print(f"Error saving lead to db: {e}")
                    
        except Exception as e:
            print(f"Error procesando parcela B2B {parcel.get('id')}: {e}")
            
    return {"leads": results}
