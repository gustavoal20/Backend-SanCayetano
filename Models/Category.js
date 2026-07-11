import db from '../DataBase/db.js';

export default class Category {
    static async getAll() {
        const [rows] = await db.execute(`SELECT * FROM Categories`);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(`SELECT * FROM Categories WHERE id = ?`, [id]);
        return rows[0];
    }
}
