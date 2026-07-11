import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    console.log("🔍 Consultando a Google qué modelos tenés habilitados con tu clave...");
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("❌ Error de la API:", data.error.message);
            return;
        }

        console.log("\n✅ Modelos disponibles en tu cuenta:");
        const models = data.models.map(m => m.name.replace('models/', ''));
        console.log(models.join('\n'));
        
        if (models.includes('gemini-1.5-flash')) {
            console.log("\n✅ ¡Tu cuenta SÍ tiene gemini-1.5-flash!");
        } else {
            console.log("\n❌ Tu cuenta NO tiene acceso a gemini-1.5-flash.");
        }
    } catch (error) {
        console.error("❌ Error de conexión:", error.message);
    }
}

listModels();
