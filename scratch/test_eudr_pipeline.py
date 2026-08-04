"""
Test del pipeline EUDR completo con la nueva integración GFW.
Verifica que el fallback funciona cuando no hay API key.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'agro_agents_api'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

import shapely.geometry
from eudr_processor import (
    check_baseline_2020_deforestation, 
    audit_topology, 
    parse_geometry,
    get_area_hectares
)
import json

print("=" * 60)
print("TEST: Pipeline EUDR con GFW (o Fallback)")
print("=" * 60)

# Test 1: Parcela en zona segura (Loja - cafe)
print("\n--- TEST 1: Parcela segura (Loja, cafe) ---")
safe_polygon = shapely.geometry.Polygon([
    (-79.65, -3.99),
    (-79.60, -3.99),
    (-79.60, -3.94),
    (-79.65, -3.94),
    (-79.65, -3.99)
])
result1 = check_baseline_2020_deforestation(safe_polygon)
print(f"  Area parcela: {get_area_hectares(safe_polygon):.2f} ha")
print(f"  Libre de deforestacion: {result1['is_deforestation_free']}")
print(f"  Area deforestada: {result1['deforested_area_hectares']} ha")
print(f"  Porcentaje afectado: {result1['affected_percentage']}%")
print(f"  Fuente de datos: {result1['data_source']}")
print(f"  Fuente satelital: {result1['satellite_source']}")
if result1.get('yearly_breakdown'):
    print(f"  Desglose anual: {result1['yearly_breakdown']}")

# Test 2: Parcela en zona de riesgo (Esmeraldas - cacao)
print("\n--- TEST 2: Parcela en riesgo (Esmeraldas, cacao) ---")
risky_polygon = shapely.geometry.Polygon([
    (-79.55, 0.85),
    (-79.45, 0.85),
    (-79.45, 0.95),
    (-79.55, 0.95),
    (-79.55, 0.85)
])
result2 = check_baseline_2020_deforestation(risky_polygon)
print(f"  Area parcela: {get_area_hectares(risky_polygon):.2f} ha")
print(f"  Libre de deforestacion: {result2['is_deforestation_free']}")
print(f"  Area deforestada: {result2['deforested_area_hectares']} ha")
print(f"  Porcentaje afectado: {result2['affected_percentage']}%")
print(f"  Fuente de datos: {result2['data_source']}")
print(f"  Fuente satelital: {result2['satellite_source']}")

# Test 3: Point geometry (debe saltar la verificacion)
print("\n--- TEST 3: Geometria de punto (skip) ---")
point = shapely.geometry.Point(-79.5, 0.9)
result3 = check_baseline_2020_deforestation(point)
print(f"  Libre de deforestacion: {result3['is_deforestation_free']}")
print(f"  Fuente: {result3['satellite_source']}")

# Test 4: Auditoría topológica
print("\n--- TEST 4: Auditoria topologica (Cacao EUDR) ---")
geom_dict = {
    "type": "Polygon",
    "coordinates": [[
        [-79.55, 0.85],
        [-79.45, 0.85],
        [-79.45, 0.95],
        [-79.55, 0.95],
        [-79.55, 0.85]
    ]]
}
topo_result, clean_geom = audit_topology(
    risky_polygon, 
    active_crop="Cacao", 
    geom_dict=geom_dict
)
print(f"  Topologia valida: {topo_result['is_valid']}")
print(f"  Es cultivo EUDR: {topo_result['rules_checked'].get('is_eudr_crop')}")
print(f"  Razon: {topo_result['reason']}")

print("\n" + "=" * 60)
print("TODOS LOS TESTS COMPLETADOS")
print("=" * 60)
