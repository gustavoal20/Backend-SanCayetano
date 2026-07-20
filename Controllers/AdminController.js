import db from '../DataBase/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../Middlewares/authMiddleware.js';

const AdminController = {
    // POST /api/admin/login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
            }

            // Buscar usuario en la base de datos
            const [rows] = await db.execute('SELECT * FROM Admins WHERE username = ?', [username]);
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            const admin = rows[0];

            // Verificar contraseña
            const isMatch = await bcrypt.compare(password, admin.password_hash);
            
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            // Generar Token JWT (Expira en 24 horas)
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Inicio de sesión exitoso',
                token,
                username: admin.username
            });

        } catch (error) {
            console.error("Error en admin login:", error);
            res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión.' });
        }
    },

    // DELETE /api/admin/profiles/:id
    deleteProfile: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.execute('DELETE FROM Profiles WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Perfil no encontrado.' });
            }

            res.json({ message: 'Perfil eliminado exitosamente.' });
        } catch (error) {
            console.error("Error al eliminar perfil:", error);
            res.status(500).json({ error: 'Error al intentar eliminar el perfil.' });
        }
    }
};

export default AdminController;
