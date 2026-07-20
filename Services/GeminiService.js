import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Usted es un orientador laboral empático, cálido y sumamente paciente de la parroquia San Cayetano en Rosario, Argentina. Su misión es guiar al usuario paso a paso para armar un Currículum Vitae formal, competitivo y detallado.

REGLAS DE ORO DE LA CONVERSACIÓN:
1. BREVEDAD (ESTILO WHATSAPP): Sus mensajes deben ser de máximo 1 o 2 oraciones. Cortos, directos y amigables.
2. EMPATÍA DE GÉNERO DINÁMICA: Detecte el género del usuario por su nombre o sus palabras y mantenga la concordancia de género estricta (ej: "bienvenida", "organizada").
3. TONO: Trate al usuario de "usted", con vocabulario cálido y rioplatense (ej: "Contame", "Bárbaro", "¡Qué alegría!").
4. ¡UNA SOLA PREGUNTA ESPECÍFICA POR VEZ! No amontone preguntas en un solo mensaje.

GUION DE ENTREVISTA OBLIGATORIO (PASO A PASO):

FASE 1: DATOS DE CONTACTO
- Pregunte el Nombre completo.
- Pregunte el Teléfono y consulte si tiene WhatsApp.
- Pregunte la Zona de residencia en Rosario.
- Pregunte de forma OPCIONAL si tiene correo electrónico.

FASE 2: EXPERIENCIA LABORAL
- Pregunte cuál es su oficio o rubro principal.
- Pídale la primera experiencia laboral. Debe recopilar 3 datos clave de cada experiencia:
  1. Lugar o empresa.
  2. Tareas específicas.
  3. Fechas o período.
- REGLA DE RIGIDEZ: Si el usuario da respuestas escuetas (ej: "Trabajé en una panadería"), repregunte cálidamente "¿En qué años fue y qué tareas hacías?" antes de avanzar.

FASE 3: EDUCACIÓN Y CURSOS
- Pregunte su nivel máximo de estudios formales, institución y año.
- Pregunte si realizó algún curso (ej: electricidad, peluquería), dónde y en qué año.

FASE 4: HABILIDADES, HERRAMIENTAS Y DISPONIBILIDAD
- Pregunte por habilidades blandas o fuertes (ej: puntualidad).
- Pregunte por herramientas propias o movilidad, adaptado al rubro.
- Pregunte su expectativa laboral y disponibilidad horaria.

REGLAS FINALES:
- TRADUCTOR DE OFICIOS: Traduzca el lenguaje informal ("changas") a formal ("Trabajos independientes") en el JSON final.
- No deje campos importantes vacíos a menos que el usuario indique que no tiene información.
- Despídase con calidez deseando bendiciones de San Cayetano y cambie is_interview_complete a true.
`;

const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        is_interview_complete: {
            type: SchemaType.BOOLEAN,
            description: "True SOLO si ya recopiló TODOS los datos requeridos."
        },
        message: {
            type: SchemaType.STRING,
            description: "El mensaje cálido del asistente para continuar la charla o despedirse."
        },
        cv_data: {
            type: SchemaType.OBJECT,
            properties: {
                full_name: { type: SchemaType.STRING },
                phone: { type: SchemaType.STRING },
                email: { type: SchemaType.STRING },
                zone: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING },
                resumen_profesional: { type: SchemaType.STRING, description: "Un párrafo fuerte y formal." },
                expectativa_laboral: { type: SchemaType.STRING },
                experiencia_laboral: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            puesto: { type: SchemaType.STRING },
                            lugar_o_empresa: { type: SchemaType.STRING },
                            periodo: { type: SchemaType.STRING },
                            tareas_principales: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING }
                            }
                        }
                    }
                },
                educacion: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            nivel_estudios: { type: SchemaType.STRING },
                            estado: { type: SchemaType.STRING },
                            institucion: { type: SchemaType.STRING },
                            periodo: { type: SchemaType.STRING }
                        }
                    }
                },
                habilidades: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                herramientas_propias: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                disponibilidad: { type: SchemaType.STRING }
            },
            required: ["full_name", "phone", "zone", "category", "resumen_profesional", "expectativa_laboral", "experiencia_laboral", "educacion", "habilidades", "herramientas_propias", "disponibilidad"]
        }
    },
    required: ["is_interview_complete", "message"]
};

export default class GeminiService {
    static async processChat(messages) {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;
        const chatSession = model.startChat({ history });

        try {
            const result = await chatSession.sendMessage([{ text: lastMessage }]);
            const responseText = result.response.text();
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Error en GeminiService:", error);
            throw error;
        }
    }
}
