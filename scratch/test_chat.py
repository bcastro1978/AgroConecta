import requests
import json

url = "http://localhost:8000/api/chat"
headers = {"Content-Type": "application/json"}
data = {
    "phone": "test_user_123",
    "message": "Hola, ¿puedes darme el pronóstico del clima para mi cultivo de cacao en Quevedo?"
}

print("Enviando petición al microservicio...")
response = requests.post(url, headers=headers, data=json.dumps(data))

print(f"Status Code: {response.status_code}")
print("Response JSON:")
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
