import GeminiService from '../Services/GeminiService.js';

export default class ChatController {
    static async handleChat(req, res) {
        try {
            const { messages } = req.body;

            // Validamos que el request tenga el formato esperado
            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ 
                    error: 'El formato de mensajes es inválido. Se espera un array "messages".' 
                });
            }

            // Llamamos al servicio de Gemini (Stateless: le pasamos todo el historial)
            const aiResponse = await GeminiService.processChat(messages);

            // aiResponse ya es un objeto JSON formateado según las reglas de nuestro prompt
            return res.json(aiResponse);
        } catch (error) {
            console.error('Error en ChatController:', error);
            return res.status(500).json({ 
                error: 'Ocurrió un error al procesar el chat con el asistente.' 
            });
        }
    }
}
