import { Router } from 'express';
import Prayer from '../Models/Prayer.js';

const router = Router();

// GET /api/prayers — Listar oraciones (paginadas)
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const offset = parseInt(req.query.offset) || 0;

        const prayers = await Prayer.getAll(limit, offset);
        const total = await Prayer.count();

        res.json({ prayers, total, limit, offset });
    } catch (error) {
        console.error('Error al obtener oraciones:', error);
        res.status(500).json({ error: 'Error al obtener las intenciones.' });
    }
});

// POST /api/prayers — Crear una nueva oración
router.post('/', async (req, res) => {
    try {
        const { author_name, category, message } = req.body;

        // Validaciones
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        if (message.trim().length > 500) {
            return res.status(400).json({ error: 'El mensaje no puede superar los 500 caracteres.' });
        }

        const validCategories = ['gracias', 'trabajo', 'intencion'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({ error: 'Categoría inválida.' });
        }

        const prayer = await Prayer.create({
            authorName: author_name ? author_name.trim().substring(0, 100) : null,
            category,
            message: message.trim()
        });

        res.status(201).json(prayer);
    } catch (error) {
        console.error('Error al crear oración:', error);
        res.status(500).json({ error: 'Error al guardar la intención.' });
    }
});

export default router;
