import 'dotenv/config';
import db from './DataBase/db.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    try {
        // Create Admins table
        console.log('Creating Admins table if not exists...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if admin already exists
        const [rows] = await db.execute('SELECT * FROM Admins WHERE username = ?', ['admin']);
        
        if (rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Create admin user
        const username = 'admin';
        const password = 'sancayetano2026';
        
        console.log(`Creating default admin user: ${username} / ${password}`);
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO Admins (username, password_hash) VALUES (?, ?)',
            [username, passwordHash]
        );

        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
