import express from 'express';
const router = express.Router();
import AdminController from '../Controllers/AdminController.js';
import { requireAuth } from '../Middlewares/authMiddleware.js';

// Autenticación de administrador
router.post('/login', AdminController.login);

// Rutas protegidas (requieren token)
router.delete('/profiles/:id', requireAuth, AdminController.deleteProfile);

export default router;
