import db from '../DataBase/db.js';

export default class Profile {
    static async create({ id, userId, categoryId, title, zone, phoneNumber, cvDataJson }) {
        const [result] = await db.execute(
            `INSERT INTO Profiles (id, user_id, category_id, title, zone, phone_number, cv_data_json, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [id, userId, categoryId, title, zone, phoneNumber, JSON.stringify(cvDataJson)]
        );
        return result;
    }

    static async getApprovedProfiles(categoryId = null) {
        let query = `
            SELECT p.id, p.title, p.zone, p.phone_number, c.name as category_name, u.name as user_name
            FROM Profiles p
            JOIN Users u ON p.user_id = u.id
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE p.status = 'APPROVED'
        `;
        const params = [];
        if (categoryId) {
            query += ` AND p.category_id = ?`;
            params.push(categoryId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT p.*, u.name as user_name, c.name as category_name 
             FROM Profiles p
             JOIN Users u ON p.user_id = u.id
             LEFT JOIN Categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async updateStatus(id, newStatus) {
        const [result] = await db.execute(
            `UPDATE Profiles SET status = ? WHERE id = ?`,
            [newStatus, id]
        );
        return result;
    }
}
