import db from '../DataBase/db.js';

export default class User {
    static async create({ id, firebaseUid, name, email }) {
        const [result] = await db.execute(
            `INSERT INTO Users (id, firebase_uid, name, email) VALUES (?, ?, ?, ?)`,
            [id, firebaseUid, name, email]
        );
        return result;
    }

    static async findByFirebaseUid(firebaseUid) {
        const [rows] = await db.execute(
            `SELECT * FROM Users WHERE firebase_uid = ?`,
            [firebaseUid]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT * FROM Users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
}
