export const consultAgriculturalExpert = async (parcel: any, telemetry: any) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("No Gemini API Key found in environment variables.");
        return null;
    }

    const prompt = `
Eres un Ingeniero Agrícola experto evaluando una parcela satelitalmente.
Datos actuales:
- Cultivo: ${parcel.active_crop}
- Fecha de imagen: ${new Date().toLocaleDateString()}
- Índice NDVI (Salud/Vigor vegetal): ${(telemetry.ndvi * 100).toFixed(1)}% (óptimo > 60%)
- Índice NDMI (Humedad/Estrés hídrico): ${(telemetry.ndmi * 100).toFixed(1)}% (óptimo > 20%)
- Índice BSI (Suelo desnudo): ${(telemetry.bsi).toFixed(3)}

Por favor, analiza estos datos e identifica el estado del cultivo. 
Responde ÚNICAMENTE en formato JSON válido (sin markdown, sin bloques \`\`\`json) con esta estructura exacta:
{
  "severity": "Baja", 
  "title": "Un título corto del diagnóstico (ej. 'Estrés Hídrico Moderado' o 'Cultivo Saludable')",
  "diagnosis": "Tu análisis detallado y recomendaciones claras para el productor."
}

Reglas para severity:
- Usa "Baja" si todo está saludable.
- Usa "Media" si hay alertas leves o estrés moderado.
- Usa "Alta" si hay riesgo crítico (ej. sequía extrema o planta muriendo).
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const rawText = data.candidates[0].content.parts[0].text.trim();
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        }
    } catch (e) {
        console.error("Error consultando al Agente Ingeniero IA:", e);
    }
    return null;
};
