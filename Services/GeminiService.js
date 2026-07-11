import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Usted es un asistente social empático, cálido y respetuoso de la iglesia San Cayetano en Rosario, Argentina.
Su objetivo es ayudar a personas (muchas veces mayores o con poca experiencia tecnológica) a armar un Currículum Vitae profesional para oficios como albañilería, limpieza, gastronomía, cuidado de personas, etc.

REGLAS DE ORO PARA LA CONVERSACIÓN:
1. Trato: Trate al usuario de "Usted", pero de forma muy cálida, amigable y paciente, usando modismos neutros de Argentina. Haga que se sientan escuchados y respetados.
2. UNA SOLA PREGUNTA A LA VEZ: Esto es crucial. Nunca haga múltiples preguntas en un solo mensaje. Vaya paso a paso (primero pregunte el nombre, espere respuesta; luego de qué trabaja, espere; luego dónde vive, etc.). Si el usuario se abruma, abandonará.
3. Traductor de Oficios: Si el usuario responde de forma muy informal (ej: "hago changas de albañil con mi sobrino"), acéptelo cálidamente en su respuesta de chat, pero internamente vaya traduciéndolo a lenguaje formal para el CV (ej: "Ayudante de albañilería con experiencia en obras").
4. Acotar la Zona: Como el proyecto es para Rosario y alrededores, intente extraer o preguntar el barrio/zona específica (ej: Zona Norte, Empalme Graneros, Centro, Funes, Villa Gobernador Gálvez) para que los filtros de la cartelera funcionen correctamente.

INSTRUCCIONES DE FORMATO:
Cuando considere que ya tiene la información básica necesaria (Nombre, Teléfono, Zona, Rubro, y algo de experiencia o habilidades), dé por terminada la entrevista completando la variable is_interview_complete a true y llenando cv_data.
`;

const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        is_interview_complete: {
            type: SchemaType.BOOLEAN,
            description: "True si ya se recolectó la información suficiente para armar el CV."
        },
        message: {
            type: SchemaType.STRING,
            description: "Respuesta conversacional al usuario (la siguiente pregunta o una despedida cálida indicando que el CV está listo)."
        },
        cv_data: {
            type: SchemaType.OBJECT,
            nullable: true,
            description: "Datos del CV si la entrevista terminó, sino nulo.",
            properties: {
                full_name: { type: SchemaType.STRING, description: "Nombre completo" },
                phone: { type: SchemaType.STRING, description: "Teléfono de contacto" },
                zone: { type: SchemaType.STRING, description: "Zona o barrio de Rosario" },
                category: { type: SchemaType.STRING, description: "Rubro principal" },
                professional_summary: { type: SchemaType.STRING, description: "Breve resumen profesional (2 o 3 líneas destacando puntos fuertes)" },
                experience: { 
                    type: SchemaType.ARRAY, 
                    description: "Lista de experiencias o habilidades (cada una formalmente redactada)",
                    items: { type: SchemaType.STRING } 
                }
            },
            required: ["full_name", "phone", "zone", "category", "professional_summary", "experience"]
        }
    },
    required: ["is_interview_complete", "message"]
};

export default class GeminiService {
    static async processChat(messages) {
        // Configuramos el modelo con System Instructions y Schema estructurado
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        // Mapear el historial del Frontend ({role: 'assistant'/'user', content: '...'}) 
        // al formato de Gemini ({role: 'model'/'user', parts: [{text: '...'}]})
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        try {
            const chat = model.startChat({
                history: history,
            });

            // Enviamos el último mensaje
            const result = await chat.sendMessage(lastMessage);
            const content = result.response.text();
            
            // Retornamos el JSON parseado garantizado por Structured Outputs
            return JSON.parse(content);
        } catch (error) {
            console.error("Error en GeminiService:", error);
            throw new Error("No se pudo procesar la respuesta de la IA (Gemini).");
        }
    }
}
