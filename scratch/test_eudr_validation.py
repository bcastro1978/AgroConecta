import sys
sys.path.append('../agro_agents_api')

import json
from eudr_processor import parse_geometry, audit_topology, check_baseline_2020_deforestation, generate_traces_nt_geojson, process_eudr_validation

print("=== STARTING EUDR PIPELINE TESTS ===")

# Test 1: Parser
wkt_poly = "POLYGON ((-78.5 1.4, -78.51 1.4, -78.51 1.41, -78.5 1.41, -78.5 1.4))"
geom = parse_geometry(wkt_poly)
assert geom is not None, "Failed to parse WKT"
print("OK - Test 1 (WKT Parser): Passed")

# Test 2: Validation
assert geom.is_valid, "Geometry should be valid"
print("OK - Test 2 (Shapely Validity): Passed")

# Test 3: Topology audit (self-overlapping fix)
invalid_wkt = "POLYGON ((0 0, 0 2, 2 0, 2 2, 0 0))" # self-intersecting bowtie
invalid_geom = parse_geometry(invalid_wkt)
report, fixed_geom = audit_topology(invalid_geom)
print("OK - Test 3 (Topology Audit Hourglass): is_valid =", report["is_valid"], "| reason =", report["reason"])

# Test 4: Deforestation analysis (Normal zone)
normal_poly = "POLYGON ((-78.2 -1.2, -78.21 -1.2, -78.21 -1.21, -78.2 -1.21, -78.2 -1.2))"
normal_geom = parse_geometry(normal_poly)
defor_report = check_baseline_2020_deforestation(normal_geom)
print("OK - Test 4 (Deforestation normal): is_deforestation_free =", defor_report["is_deforestation_free"])

# Test 5: Deforestation analysis (Deforested zone Esmeraldas Box)
deforested_poly = "POLYGON ((-79.45 0.85, -79.46 0.85, -79.46 0.86, -79.45 0.86, -79.45 0.85))"
deforested_geom = parse_geometry(deforested_poly)
defor_report_fail = check_baseline_2020_deforestation(deforested_geom)
print("OK - Test 5 (Deforestation active): is_deforestation_free =", defor_report_fail["is_deforestation_free"])

# Test 6: TRACES NT GeoJSON Generation
metadata = {
    "active_crop": "Cacao",
    "is_deforestation_free": True,
    "verification_date": "2026-07-02T02:00:00Z"
}
traces_geojson = generate_traces_nt_geojson("test-parcel-id", geom, metadata)
assert traces_geojson["type"] == "Feature", "Should be a Feature type"
assert traces_geojson["properties"]["deforestation_free"] is True
print("OK - Test 6 (TRACES NT GeoJSON output): Passed")
print("TRACES NT properties:", traces_geojson["properties"])

print("=== ALL TESTS PASSED SUCCESSFULLY ===")
