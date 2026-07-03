import os
import sys
import json
import shapely.geometry
import shapely.wkt

sys.path.append('../agro_agents_api')
from tools import supabase
from eudr_processor import parse_geometry, get_area_hectares

def count_decimals(val: float) -> int:
    s = f"{val:.15f}".rstrip('0')
    if '.' in s:
        return len(s.split('.')[1])
    return 0

def check_coordinate_precision(coords) -> tuple:
    min_decimals = 99
    violations = []
    
    # Flatten coordinates list
    def flatten(c_list):
        for item in c_list:
            if isinstance(item, (list, tuple)):
                if len(item) == 2 and isinstance(item[0], (int, float)):
                    yield item
                else:
                    yield from flatten(item)
                    
    for pt in flatten(coords):
        lng, lat = pt
        lng_dec = count_decimals(lng)
        lat_dec = count_decimals(lat)
        min_decimals = min(min_decimals, lng_dec, lat_dec)
        
        # Check WGS84 bounds
        if not (-180 <= lng <= 180) or not (-90 <= lat <= 90):
            violations.append(f"Fuera de rango WGS84: ({lng}, {lat})")
            
        if lng_dec < 6 or lat_dec < 6:
            violations.append(f"Precisión insuficiente ({lng_dec}/{lat_dec} decs) en punto: ({lng}, {lat})")
            
    return min_decimals, violations

def diagnose_parcels():
    print("==================================================")
    # Cambiamos a la codificación UTF-8 para la salida estándar del script para evitar fallos en Windows
    sys.stdout.reconfigure(encoding='utf-8')
    print("🔍 INICIANDO DIAGNÓSTICO TÉCNICO DE CUMPLIMIENTO EUDR")
    print("==================================================\n")
    
    try:
        res = supabase.table('parcels').select('id, active_crop, geometry').execute()
        parcels = res.data
        if not parcels:
            print("No se encontraron parcelas en la base de datos.")
            return
            
        print(f"Total de parcelas a evaluar: {len(parcels)}\n")
        
        violations_summary = []
        
        for idx, parcel in enumerate(parcels):
            p_id = parcel['id']
            crop = parcel.get('active_crop', 'Cultivo sin nombre')
            geom_dict = parcel.get('geometry')
            
            print(f"[{idx+1}] Evaluando Finca: {crop} (ID: {p_id[:8]}...)")
            
            geom = parse_geometry(geom_dict)
            if not geom:
                print("   ❌ ERROR CRÍTICO: Geometría ilegible.")
                violations_summary.append((p_id, crop, "Geometría ilegible"))
                continue
                
            geom_type = geom.geom_type
            area_ha = get_area_hectares(geom)
            print(f"   - Tipo de Geometría: {geom_type}")
            print(f"   - Área Calculada: {area_ha:.4f} hectáreas")
            
            p_violations = []
            
            # Condición 1: Obligatoriedad según tamaño (Umbral 4 Hectáreas)
            if area_ha > 4.0 and geom_type == 'Point':
                p_violations.append(f"Condición 1 (Fallo): Área de {area_ha:.2f} ha > 4 ha, pero usa un único punto en lugar de un polígono.")
            elif area_ha <= 4.0 and geom_type == 'Point':
                print("   - Condición 1 (Paso): Finca <= 4 ha. Se acepta punto GPS.")
            else:
                print("   - Condición 1 (Paso): Finca usa polígono delimitado perimetralmente.")
                
            # Condición 2: Precisión de Coordenadas
            coords = geom_dict.get('coordinates', [])
            min_dec, prec_violations = check_coordinate_precision(coords)
            if prec_violations:
                p_violations.append(f"Condición 2 (Fallo): Coordenadas WGS84 con precisión menor a 6 decimales (Mínimo: {min_dec} decimales).")
            else:
                print(f"   - Condición 2 (Paso): Todas las coordenadas tienen >= 6 decimales ({min_dec} decs) y están en WGS84.")
                
            # Condición 3: Fidelidad de límites reales (No zonas macro administrativas)
            if area_ha > 1000.0:
                p_violations.append(f"Condición 3 (Fallo): Área excesivamente grande ({area_ha:.2f} ha), indica posible límite administrativo o área macro no parcelaria.")
            else:
                print("   - Condición 3 (Paso): Área dentro de rangos parcelarios normales (< 1000 ha).")
                
            # Condición 4: Un polígono por parcela (No agrupaciones múltiples desarticuladas)
            if geom_type == 'MultiPolygon':
                # Si es MultiPolygon, verificar la distancia entre partes
                parts = list(geom.geoms)
                max_distance = 0
                for i in range(len(parts)):
                    for j in range(i+1, len(parts)):
                        # Distancia en grados aproximada (1 grado ≈ 111 km)
                        dist_deg = parts[i].distance(parts[j])
                        dist_meters = dist_deg * 111000
                        max_distance = max(max_distance, dist_meters)
                if max_distance > 500: # si distan más de 500 metros
                    p_violations.append(f"Condición 4 (Fallo): MultiPolígono agrupa parcelas separadas por {max_distance:.1f} metros. Deben registrarse por separado.")
                else:
                    print("   - Condición 4 (Paso): Polígono contiguo o agrupaciones muy cercanas (<500m).")
            else:
                print("   - Condición 4 (Paso): Representa una única parcela contigua.")
                
            # Condición 5: Calidad topográfica (Sin auto-intersección ni solapamiento)
            if not geom.is_valid:
                p_violations.append("Condición 5 (Fallo): El polígono tiene errores topológicos (auto-intersecciones o polígono abierto).")
            else:
                # Verificar solapamiento con otras
                overlaps = []
                for other in parcels:
                    if other['id'] == p_id:
                        continue
                    other_geom = parse_geometry(other.get('geometry'))
                    if other_geom and other_geom.is_valid and geom.intersects(other_geom):
                        intersection_area = get_area_hectares(geom.intersection(other_geom))
                        if intersection_area > 0.01:
                            overlaps.append(f"ID {other['id'][:8]}... ({intersection_area:.4f} ha)")
                if overlaps:
                    p_violations.append(f"Condición 5 (Fallo): Presenta solapamientos limítrofes críticos con: {', '.join(overlaps)}.")
                else:
                    print("   - Condición 5 (Paso): Geometría topológicamente limpia y sin solapamientos.")
            
            # Resultados para la parcela
            if p_violations:
                print("   ⚠️ VIOLACIONES DETECTADAS:")
                for v in p_violations:
                    print(f"     • {v}")
                    violations_summary.append((p_id, crop, v))
            else:
                print("   ✅ APTO EUDR: Finca cumple con todos los requerimientos técnicos y de formato.")
            print("-" * 50)
            
        print("\n==================================================")
        print("📊 RESUMEN DE DIAGNÓSTICO DE CUMPLIMIENTO EUDR")
        print("==================================================")
        if violations_summary:
            print(f"Total de incidencias encontradas: {len(violations_summary)}")
            for p_id, crop, v in violations_summary:
                print(f" - {crop} ({p_id[:8]}...): {v}")
        else:
            print("🎉 ¡Excelente! Todas las parcelas de la base de datos cumplen con los parámetros del Reglamento EUDR.")
        print("==================================================")

    except Exception as e:
        print(f"Error ejecutando diagnóstico: {e}")

if __name__ == '__main__':
    diagnose_parcels()
