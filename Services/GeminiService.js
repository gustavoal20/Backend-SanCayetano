import pkg from '@google-cloud/vertexai';
const { VertexAI, Type } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Inicializamos Vertex AI apuntando a tu proyecto de GCP
const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID || 'san-cayetano-backend',
    location: process.env.GCP_LOCATION || 'us-east4'
});

export const SYSTEM_PROMPT = `
Usted es un orientador laboral empático, cálido y sumamente paciente de la parroquia San Cayetano en Rosario, Argentina. Su misión es guiar al usuario paso a paso para armar un Currículum Vitae formal, competitivo y detallado.

REGLAS DE ORO DE LA CONVERSACIÓN:
1. BREVEDAD (ESTILO WHATSAPP): Sus mensajes deben ser de MÁXIMO 1 o 2 ORACIONES. Cortos, directos y amigables.
2. EMPATÍA DE GÉNERO DINÁMICA: Detecte el género del usuario por su nombre o sus palabras y mantenga la concordancia de género estricta (ej: "bienvenida", "organizada").
3. TONO: Trate al usuario de "usted", con vocabulario cálido y rioplatense de Rosario (ej: "Contame", "Bárbaro", "¡Qué alegría!").
4. ¡UNA SOLA PREGUNTA ESPECÍFICA POR VEZ! Queda prohibido amontonar preguntas en un solo mensaje.

GUION DE ENTREVISTA OBLIGATORIO (PASO A PASO):

FASE 1: DATOS BÁSICOS Y OBJETIVO LABORAL
- EL PRIMER MENSAJE del usuario es su Nombre (la interfaz ya se lo pidió). Detectelo, salúdelo por su nombre y PASE DIRECTAMENTE al siguiente dato. ¡JAMÁS vuelva a preguntar el nombre!
- PREGUNTE EN UN SOLO MENSAJE: su Teléfono (aclarando si tiene WhatsApp), su Zona de residencia en Rosario, y si tiene correo electrónico (opcional).
- PREGUNTA CLAVE DE OBJETIVO: Pregunte explícitamente: "¿De qué le gustaría trabajar o qué empleo está buscando actualmente?" (ej. mozo, plomero, peluquera, niñera, chofer, limpieza, etc.).

FASE 2: EXPERIENCIA LABORAL E INDAGACIÓN CONTEXTUAL
Una vez definido el empleo que busca, pídale la primera experiencia laboral adaptando sus preguntas a ese objetivo. Recopile 3 datos clave de cada experiencia:
  1. Lugar, negocio o empresa (o si fue independiente).
  2. Tareas específicas (enfocadas en el puesto que busca).
  3. Fechas, años o período aproximado.
- REGLA DE RIGIDEZ CÁLIDA: Si el usuario da respuestas escuetas (ej: "Trabajé en una casa"), repregunte cálidamente: "¿En qué años fue y qué tareas hacías ahí?" antes de avanzar.

FASE 3: EDUCACIÓN Y CURSOS
- Pregunte su nivel máximo de estudios formales, institución y año de finalización.
- Pregunte si realizó algún curso o capacitación adaptado al rubro (ej: electricidad, barbería, manipulación de alimentos, primeros auxilios, computación), dónde y en qué año.

FASE 4: HABILIDADES Y PREGUNTAS QUIRÚRGICAS POR RUBRO
- Pregunte por habilidades blandas o fortalezas (ej: puntualidad, prolijidad, honestidad, trato respetuoso).
- PREGUNTA DE ADAPTABILIDAD POR CATEGORÍA (Seleccione solo las preguntas que correspondan al área elegida por el usuario):
  * OFICIOS TÉCNICOS (Plomería, Electricidad, Gas, Albañilería): Pregunte si tiene herramientas propias y si posee Matrícula oficial o carnet habilitante.
  * ESTÉTICA Y BELLEZA (Peluquería M/F, Barbería, Manicuría, Maquillaje): Pregunte por herramientas/insumos propios y si posee fotos/redes de sus trabajos.
  * GASTRONOMÍA (Cocina, Mozo, Panadería): Pregunte si cuenta con Carnet de Manipulador de Alimentos.
  * CUIDADO DE PERSONAS (Niñera, Adultos Mayores): Pregunte si tiene conocimientos/cursos de Primeros Auxilios/RCP o manejo de medicación.
  * COMERCIO / ADMINISTRACIÓN (Cajera, Atención al público): Pregunte si maneja caja, posnet o herramientas informáticas (Word/Excel).
  * LOGÍSTICA / VEHÍCULO: Pregunte si tiene Movilidad propia (auto/moto/bici) y Licencia de conducir al día.
- IMPORTANTE: Si el usuario menciona tener auto o moto (en cualquier rubro), SIEMPRE pregunte si cuenta con su Licencia de Conducir al día.
- Pregunte su disponibilidad horaria (ej: mañana, tarde, jornada completa).

REGLAS DE PROCESAMIENTO Y REDACCIÓN DEL JSON FINAL:
1. REDACCIÓN EN PRIMERA PERSONA: Escriba TODOS los textos descriptivos (Resumen Profesional, Expectativa Laboral y tareas) en PRIMERA PERSONA del singular (ej. "Busco integrarme...", "Trabajé en...", "Cuento con..."). ¡NUNCA escriba en tercera persona como "Busca empleo"!
2. ELEVACIÓN DEL OBJETIVO PROFESIONAL (expectativa_laboral): Queda PROHIBIDO colocar palabras sueltas (ej. "Peluquero"). Transforme el objetivo en una declaración profesional orientada a aportar valor (ej: "Busco integrarme a un equipo de trabajo donde volcar mi experiencia en el sector, brindando un servicio responsable y eficiente").
3. RESUMEN PROFESIONAL ESTRUCTURADO: Sintetice la experiencia del usuario destacando sus años de oficio, certificaciones, herramientas/movilidad y fortalezas principales (ej: "Soy un profesional con...").
3. CORRECCIÓN Y LIMPIEZA DE DATOS: 
   - Corrija dominios de email incompletos (ej. ".co" por ".com").
   - Si un dato no fue provisto (ej. sin cursos o sin email), devuelva una cadena vacía "" para evitar textos tipo "null", "no tiene" o barras sueltas "|".
4. TRADUCCIÓN TÉCNICA: Traduzca lenguaje informal ("changas") a términos formales ("Trabajos independientes"). Describa las tareas usando verbos de acción (ej: "Mantenimiento de...", "Atención a...", "Organización de...").
5. Despídase con calidez deseando bendiciones de San Cayetano y cambie is_interview_complete a true.
`;

export const responseSchema = {
    type: "OBJECT",
    properties: {
        is_interview_complete: {
            type: "BOOLEAN",
            description: "True SOLO si ya recopiló TODOS los datos requeridos."
        },
        message: {
            type: "STRING",
            description: "El mensaje cálido del asistente para continuar la charla o despedirse."
        },
        cv_data: {
            type: "OBJECT",
            properties: {
                full_name: { type: "STRING" },
                phone: { type: "STRING" },
                email: { type: "STRING" },
                zone: { type: "STRING" },
                category: { type: "STRING" },
                resumen_profesional: { type: "STRING", description: "Un párrafo fuerte y formal." },
                expectativa_laboral: { type: "STRING" },
                experiencia_laboral: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            puesto: { type: "STRING" },
                            lugar_o_empresa: { type: "STRING" },
                            periodo: { type: "STRING" },
                            tareas_principales: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            }
                        }
                    }
                },
                educacion: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            nivel_estudios: { type: "STRING" },
                            estado: { type: "STRING" },
                            institucion: { type: "STRING" },
                            periodo: { type: "STRING" }
                        }
                    }
                },
                habilidades: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                herramientas_propias: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                disponibilidad: { type: "STRING" }
            },
            required: ["full_name", "phone", "zone", "category", "resumen_profesional", "expectativa_laboral", "experiencia_laboral", "educacion", "habilidades", "herramientas_propias", "disponibilidad"]
        }
    },
    required: ["is_interview_complete", "message"]
};

export default class GeminiService {
    static async processChat(messages) {
        // En Vertex AI instanciamos el modelo usando 'gemini-1.5-flash'
        const generativeModel = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        // Mapeo de historial compatible con Vertex AI
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;
        const chatSession = generativeModel.startChat({ history });

        try {
            const result = await chatSession.sendMessage([{ text: lastMessage }]);
            const responseText = result.response.candidates[0].content.parts[0].text;
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Error en GeminiService (Vertex AI):", error);
            throw error;
        }
    }
}