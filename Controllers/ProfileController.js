import pool from '../DataBase/db.js';
import crypto from 'crypto';

export default class ProfileController {
    // POST /api/profiles (Guardar CV - Público / Usuario Autenticado)
    static async createProfile(req, res) {
        try {
            // Se asume que el Frontend enviará el user_id (después de registrar el usuario en la tabla Users)
            const { user_id, title, phone_number, zone, category_id, cv_data_json } = req.body;
            
            // Validaciones básicas
            if (!user_id || !title || !phone_number || !zone || !cv_data_json) {
                return res.status(400).json({ error: 'Faltan campos obligatorios para guardar el perfil del CV.' });
            }

            const id = crypto.randomUUID();
            const status = 'PENDING'; // 'pendiente_revision' en la base de datos

            const [result] = await pool.execute(
                `INSERT INTO Profiles (id, user_id, category_id, title, zone, phone_number, cv_data_json, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, user_id, category_id || null, title, zone, phone_number, JSON.stringify(cv_data_json), status]
            );

            res.status(201).json({ 
                message: 'CV guardado exitosamente y pendiente de revisión.', 
                id,
                status: 'pendiente_revision'
            });
        } catch (error) {
            console.error('Error creando perfil:', error);
            res.status(500).json({ error: 'Error interno del servidor al guardar el CV en la base de datos.' });
        }
    }

    // GET /api/profiles (Cartelera Pública)
    static async getProfiles(req, res) {
        try {
            const { category_id } = req.query;
            
            // Solo traemos los publicados ('APPROVED')
            let query = `
                SELECT id, title, zone, phone_number, category_id, cv_data_json, created_at 
                FROM Profiles 
                WHERE status = 'APPROVED'
            `;
            let params = [];

            if (category_id) {
                query += ` AND category_id = ?`;
                params.push(category_id);
            }

            query += ` ORDER BY created_at DESC`;

            const [rows] = await pool.execute(query, params);
            
            // mysql2 parsea automáticamente los campos JSON al enviarlos en res.json
            res.json(rows);
        } catch (error) {
            console.error('Error obteniendo perfiles de la cartelera:', error);
            res.status(500).json({ error: 'Error interno del servidor al obtener la cartelera de oficios.' });
        }
    }

    // PATCH /api/profiles/:id/status (Moderación - Admin)
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; 

            // Mapeamos los estados en español a los ENUMs de la base de datos
            let dbStatus = '';
            if (status === 'publicado') dbStatus = 'APPROVED';
            else if (status === 'rechazado') dbStatus = 'REJECTED';
            else return res.status(400).json({ error: "Estado inválido. Debe ser 'publicado' o 'rechazado'." });

            const [result] = await pool.execute(
                `UPDATE Profiles SET status = ? WHERE id = ?`,
                [dbStatus, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Perfil no encontrado en la base de datos.' });
            }

            res.json({ message: `Estado del CV actualizado correctamente a ${status} (${dbStatus}).` });
        } catch (error) {
            console.error('Error actualizando estado del CV:', error);
            res.status(500).json({ error: 'Error interno del servidor al actualizar el estado de moderación.' });
        }
    }
}
