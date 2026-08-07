import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend San Cayetano is running.' });
});

// Rutas
import chatRoutes from './Routes/chatRoutes.js';
import profileRoutes from './Routes/profileRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import prayerRoutes from './Routes/prayerRoutes.js';

app.use('/api/chat', chatRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prayers', prayerRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});