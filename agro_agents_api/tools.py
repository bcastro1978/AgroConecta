import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_core.tools import tool
from typing import Dict, Any, Optional

load_dotenv(dotenv_path="../.env")

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in .env")

supabase: Client = create_client(url, key)

@tool
def get_parcel_info(parcel_id: str) -> Dict[str, Any]:
    """
    Obtiene la información básica de la parcela (lote) desde la base de datos, 
    incluyendo el cultivo activo, la provincia, el nombre y los datos del productor.
    """
    try:
        response = supabase.table('parcels').select('*, producer:users(*)').eq('id', parcel_id).execute()
        if response.data:
            return response.data[0]
        return {"error": "Parcel not found"}
    except Exception as e:
        return {"error": str(e)}

@tool
def get_latest_copernicus_telemetry(parcel_id: str) -> Dict[str, Any]:
    """
    Obtiene el último registro satelital de telemetría (NDVI, NDMI, BSI, radar VV/VH, nubosidad)
    almacenado para una parcela específica. Útil para determinar la salud actual del cultivo, 
    estrés hídrico y anomalías de biomasa de forma instantánea.
    """
    try:
        response = supabase.table('sat_telemetry').select('*').eq('parcel_id', parcel_id).order('timestamp', desc=True).limit(1).execute()
        if response.data:
            return response.data[0]
        return {"error": "No telemetry data found for this parcel"}
    except Exception as e:
        return {"error": str(e)}

@tool
def get_b2b_providers(category: str, limit: int = 5) -> list[Dict[str, Any]]:
    """
    Busca en el marketplace B2B proveedores para una categoría específica 
    (Ej: 'Insumos', 'Maquinaria', 'Finanzas'). Útil cuando se necesita recomendar
    acciones que impliquen compras o servicios agrícolas.
    """
    try:
        response = supabase.table('b2b_providers').select('*').eq('category', category).limit(limit).execute()
        if response.data:
            return response.data
        return [{"error": f"No providers found for category {category}"}]
    except Exception as e:
        return [{"error": str(e)}]
