import express from 'express';
import ProfileController from '../Controllers/ProfileController.js';

const router = express.Router();

// -------------------------------------------------------------
// Middlewares placeholders para Auth (Firebase)
// -------------------------------------------------------------
const requireAuth = (req, res, next) => {
    // TODO: Implementar validación del token de Firebase JWT aquí
    // const authHeader = req.headers.authorization;
    // Si no es válido -> res.status(401).json({error: 'Unauthorized'})
    next();
};

const requireAdmin = (req, res, next) => {
    // TODO: Validar que el usuario verificado tenga el rol 'ADMIN' en nuestra BD MySQL
    // Si no es admin -> res.status(403).json({error: 'Forbidden'})
    next();
};

// -------------------------------------------------------------
// Rutas
// -------------------------------------------------------------

// Guardar un nuevo CV (lo dejamos abierto o requireAuth según el flujo del Frontend)
router.post('/', ProfileController.createProfile);

// Ver la cartelera de oficios publicados (Ruta 100% pública)
router.get('/', ProfileController.getProfiles);

// Cambiar estado de moderación (Ruta protegida para Administradores de la Iglesia)
router.patch('/:id/status', requireAuth, requireAdmin, ProfileController.updateStatus);

export default router;
