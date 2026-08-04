"""
Script de prueba para verificar la integración con Global Forest Watch API.
Usa un polígono de prueba en Esmeraldas, Ecuador (zona cacaotera con deforestación conocida).
"""
import requests
import json

# Polígono de prueba: Zona cacaotera en Esmeraldas, Ecuador
# (Área con deforestación documentada post-2020)
test_polygon_esmeraldas = {
    "type": "Polygon",
    "coordinates": [[
        [-79.55, 0.85],
        [-79.45, 0.85],
        [-79.45, 0.95],
        [-79.55, 0.95],
        [-79.55, 0.85]
    ]]
}

# Polígono de prueba: Zona cafetera en Loja, Ecuador  
# (Área sin deforestación significativa)
test_polygon_loja = {
    "type": "Polygon",
    "coordinates": [[
        [-79.65, -3.99],
        [-79.60, -3.99],
        [-79.60, -3.94],
        [-79.65, -3.94],
        [-79.65, -3.99]
    ]]
}

GFW_API_URL = "https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query"

sql_query = (
    "SELECT umd_tree_cover_loss__year, SUM(area__ha) as total_loss_ha "
    "FROM results "
    "WHERE umd_tree_cover_loss__year >= 2021 "
    "GROUP BY umd_tree_cover_loss__year "
    "ORDER BY umd_tree_cover_loss__year"
)

def test_gfw_query(polygon, name):
    print(f"\n{'='*60}")
    print(f"PRUEBA: {name}")
    print(f"{'='*60}")
    
    payload = {
        "geometry": polygon,
        "sql": sql_query
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"[->] Consultando GFW API...")
        response = requests.post(GFW_API_URL, headers=headers, json=payload, timeout=30)
        
        print(f"[<-] HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            rows = result.get("data", [])
            
            print(f"[OK] Registros encontrados: {len(rows)}")
            
            total_loss = 0.0
            for row in rows:
                year = row.get("umd_tree_cover_loss__year")
                loss = row.get("total_loss_ha", 0.0)
                total_loss += (loss or 0.0)
                print(f"    Ano {year}: {loss:.4f} ha perdidas")
            
            print(f"\n    TOTAL perdida post-2020: {total_loss:.4f} ha")
            if total_loss > 0.5:
                print(f"    Estado EUDR: FALLO - Deforestacion detectada")
            else:
                print(f"    Estado EUDR: APROBADO - Libre de deforestacion")
            
            return True
        else:
            print(f"[ERROR] {response.text[:300]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"[ERROR] Timeout (30s)")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("VERIFICACION DE INTEGRACION GFW / HANSEN")
    print("AgroConecta EUDR Processor v2.0")
    print("=" * 60)
    
    ok1 = test_gfw_query(test_polygon_esmeraldas, "Esmeraldas (zona de riesgo)")
    ok2 = test_gfw_query(test_polygon_loja, "Loja (zona cafetera segura)")
    
    print(f"\n{'='*60}")
    if ok1 and ok2:
        print("RESULTADO: API GFW funcional")
    else:
        print("RESULTADO: Verificar conexion")
    print(f"{'='*60}")
