async function testChat() {
    console.log("🚀 Simulando que el Frontend envía el primer mensaje al Backend...");
    
    // Este es el formato de historial que enviará el frontend
    const payload = {
        messages: [
            { role: 'user', content: 'Hola, necesito armar mi CV. Hago changas de albañil.' }
        ]
    };

    try {
        const response = await fetch('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("❌ Error del servidor:", data);
            return;
        }

        console.log("\n✅ Respuesta estructurada de OpenAI:\n");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("❌ Error de conexión. ¿Te aseguraste de encender el servidor app.js primero?", error.message);
    }
}

testChat();
