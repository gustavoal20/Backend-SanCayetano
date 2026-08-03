import db from '../DataBase/db.js';

export default class Prayer {
    static async create({ authorName, category, message }) {
        const [result] = await db.execute(
            `INSERT INTO Prayers (author_name, category, message) VALUES (?, ?, ?)`,
            [authorName || null, category, message]
        );
        return { id: result.insertId, author_name: authorName || null, category, message, created_at: new Date() };
    }

    static async getAll(limit = 20, offset = 0) {
        const [rows] = await db.execute(
            `SELECT * FROM Prayers ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [String(limit), String(offset)]
        );
        return rows;
    }

    static async count() {
        const [rows] = await db.execute(`SELECT COUNT(*) as total FROM Prayers`);
        return rows[0].total;
    }
}
