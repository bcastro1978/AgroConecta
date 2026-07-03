import sys
import os

# Add the directory to sys.path so we can import the app
sys.path.append(os.path.abspath('c:/PERSONAL/IA/AGROCONECTA/agro_agents_api'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("Enviando petición de prueba al microservicio (via TestClient)...")
try:
    response = client.post("/api/chat", json={
        "phone": "test_user_123",
        "message": "Hola, necesito información de clima en Quevedo."
    })
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response JSON:")
        print(response.json())
    else:
        print("Response Text:")
        print(response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
