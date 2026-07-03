import sys
sys.path.append('../agro_agents_api')
sys.path.append('agro_agents_api')

import json
import shapely.geometry
from eudr_processor import parse_geometry, audit_topology, check_baseline_2020_deforestation, generate_traces_nt_geojson

def run_e2e_tests():
    print("====================================================")
    print("   EJECUCIÓN DE PRUEBAS INTEGRALES DE FLUJO EUDR")
    print("====================================================\n")

    # 5 Casos de Uso / Productos a testear:
    # 1. Café (Regulado, Polígono Válido, Sin Deforestación) -> Validado
    # 2. Cacao (Regulado, Polígono Válido, Con Deforestación Histórica) -> Fallido (Deforestación)
    # 3. Madera (Regulado, Fallo Regla 2: Precisión < 6 decimales) -> Fallido (Precisión)
    # 4. Papa Superchola (No Regulado, Polígono Válido) -> Validado (Excluido de EUDR)
    # 5. Maíz Suave (No Regulado, Punto GPS) -> Validado (Excluido de EUDR)

    test_cases = [
        {
            "name": "Caso 1: Café (Regulado, Válido)",
            "crop": "Café Bourbon",
            "geom_wkt": "POLYGON ((-78.500001 1.400001, -78.510001 1.400001, -78.510001 1.410001, -78.500001 1.410001, -78.500001 1.400001))",
            "geom_dict": {
                "type": "Polygon",
                "coordinates": [[
                    [-78.500001, 1.400001],
                    [-78.510001, 1.400001],
                    [-78.510001, 1.410001],
                    [-78.500001, 1.410001],
                    [-78.500001, 1.400001]
                ]]
            }
        },
        {
            "name": "Caso 2: Cacao (Regulado, Con Deforestación)",
            "crop": "Cacao CCN-51",
            "geom_wkt": "POLYGON ((-79.450001 0.850001, -79.460001 0.850001, -79.460001 0.860001, -79.450001 0.860001, -79.450001 0.850001))",
            "geom_dict": {
                "type": "Polygon",
                "coordinates": [[
                    [-79.450001, 0.850001],
                    [-79.460001, 0.850001],
                    [-79.460001, 0.860001],
                    [-79.450001, 0.860001],
                    [-79.450001, 0.850001]
                ]]
            }
        },
        {
            "name": "Caso 3: Madera (Regulado, Fallo Precisión)",
            "crop": "Madera Teca",
            "geom_wkt": "POLYGON ((-78.50 1.40, -78.51 1.40, -78.51 1.41, -78.50 1.41, -78.50 1.40))",
            "geom_dict": {
                "type": "Polygon",
                "coordinates": [[
                    [-78.50, 1.40],
                    [-78.51, 1.40],
                    [-78.51, 1.41],
                    [-78.50, 1.41],
                    [-78.50, 1.40]
                ]]
            }
        },
        {
            "name": "Caso 4: Papa Superchola (No Regulado)",
            "crop": "Papa Superchola",
            "geom_wkt": "POLYGON ((-78.500001 1.400001, -78.510001 1.400001, -78.510001 1.410001, -78.500001 1.410001, -78.500001 1.400001))",
            "geom_dict": {
                "type": "Polygon",
                "coordinates": [[
                    [-78.500001, 1.400001],
                    [-78.510001, 1.400001],
                    [-78.510001, 1.410001],
                    [-78.500001, 1.410001],
                    [-78.500001, 1.400001]
                ]]
            }
        },
        {
            "name": "Caso 5: Maíz Suave (No Regulado, Punto GPS)",
            "crop": "Maíz Suave",
            "geom_wkt": "POINT (-78.500001 1.400001)",
            "geom_dict": {
                "type": "Point",
                "coordinates": [-78.500001, 1.400001]
            }
        }
    ]

    for tc in test_cases:
        print(f"--- {tc['name']} ---")
        print(f"Cultivo: {tc['crop']}")
        geom = parse_geometry(tc['geom_wkt'])
        
        # 1. Auditoría topográfica
        topology_report, clean_geom = audit_topology(geom, active_crop=tc['crop'], geom_dict=tc['geom_dict'])
        print(f"  [Topología] Válido: {topology_report['is_valid']} | Razón: {topology_report['reason']}")
        
        # Si la topología falla, determinamos resultado final
        if not topology_report["is_valid"]:
            print("  [Resultado Final] ESTADO: Failed (Fallo de Topología/Reglas)")
            print("  [TRACES NT] Excluido / No generado.\n")
            continue

        # 2. Análisis de Deforestación
        crop_lower = tc['crop'].lower()
        eudr_crops = ["cacao", "cocoa", "café", "cafe", "coffee", "palma", "madera", "ganado"]
        is_eudr = any(c in crop_lower for c in eudr_crops)
        
        if is_eudr:
            deforest_report = check_baseline_2020_deforestation(clean_geom)
            is_deforestation_free = deforest_report["is_deforestation_free"]
            print(f"  [Satélite EUDR] Libre de Deforestación: {is_deforestation_free} | Afectación: {deforest_report.get('affected_percentage', 0)}%")
        else:
            is_deforestation_free = True
            print("  [Satélite EUDR] Omitido (Producto No Regulado por EUDR)")

        # 3. Resultado final
        if is_eudr and not is_deforestation_free:
            eudr_status = "Failed"
        else:
            eudr_status = "Validated"
            
        print(f"  [Resultado Final] ESTADO: {eudr_status}")
        
        # Generar GeoJSON para TRACES NT si es Validado
        metadata = {
            "active_crop": tc['crop'],
            "is_deforestation_free": is_deforestation_free,
            "verification_date": "2026-07-02T11:00:00Z"
        }
        traces_geojson = generate_traces_nt_geojson("test-parcel-id", clean_geom, metadata)
        print("  [TRACES NT GeoJSON Generado] Propiedades:")
        print(f"    - Especie/Cultivo: {traces_geojson['properties']['crop']}")
        print(f"    - Libre Deforestación: {traces_geojson['properties']['deforestation_free']}")
        print(f"    - Hectáreas: {traces_geojson['properties']['area_hectares']}")
        print(f"    - Estándar: {traces_geojson['properties']['standard']}\n")

if __name__ == "__main__":
    run_e2e_tests()
