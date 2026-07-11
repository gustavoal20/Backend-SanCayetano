import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function migrate() {
    console.log('⏳ Intentando conectar a MySQL con las credenciales del archivo .env...');
    try {
        // Conectamos sin especificar la base de datos primero
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true // Permite ejecutar todo el archivo .sql de una vez
        });

        console.log('✅ Conectado a MySQL.');

        const sqlFilePath = path.join(process.cwd(), 'DataBase', 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('⚙️ Ejecutando init.sql y creando tablas...');
        await connection.query(sql);

        console.log('🎉 ¡Base de datos y tablas creadas con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando las tablas:', error.message);
        console.log('\nPor favor, revisá que MySQL esté encendido y que el usuario/contraseña en tu archivo .env sean correctos.');
        process.exit(1);
    }
}

migrate();
