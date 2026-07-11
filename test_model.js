import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testeando gemini-1.5-flash SIN schema...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hola, esto es una prueba. Respondeme 'OK' si me recibis.");
        console.log("✅ Éxito:", result.response.text());
    } catch (e) {
        console.log("❌ Falló SIN schema:", e.message);
    }
}

test();
