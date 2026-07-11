import express from 'express';
import ChatController from '../Controllers/ChatController.js';

const router = express.Router();

// Endpoint para enviar el historial de mensajes a la IA
router.post('/', ChatController.handleChat);

export default router;
