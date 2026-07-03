const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: "test_user_123",
    message: "Hola, necesito información sobre el clima en mi zona."
  })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
