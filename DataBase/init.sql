-- Script de inicialización de la base de datos para San Cayetano

-- La base de datos ya es provista por el hosting (ej. Filess.io)
-- y se selecciona automáticamente en la conexión.

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(36) PRIMARY KEY, -- UUID interno
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Oficios / Rubros
CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Tabla de Perfiles / CVs (Para la Cartelera)
CREATE TABLE IF NOT EXISTS Profiles (
    id VARCHAR(36) PRIMARY KEY, -- UUID interno
    user_id VARCHAR(36) NOT NULL,
    category_id INT,
    title VARCHAR(150) NOT NULL,
    zone VARCHAR(100) NOT NULL, -- Zona de residencia o trabajo (ej. Rosario Sur)
    phone_number VARCHAR(20) NOT NULL,
    cv_data_json JSON NOT NULL, -- Todo el detalle denso (experiencia, educación) va acá
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

-- Insertar rubros por defecto
INSERT IGNORE INTO Categories (name, description) VALUES 
('Construcción y Albañilería', 'Trabajos de albañilería, plomería, electricidad, pintura, etc.'),
('Limpieza y Mantenimiento', 'Limpieza de hogares, oficinas, mantenimiento general.'),
('Gastronomía', 'Cocina, ayudante de cocina, bachero, mozo.'),
('Cuidado de Personas', 'Cuidado de niños, adultos mayores, acompañante terapéutico.');

-- Tabla de Oraciones / Intenciones (Muro de Oraciones)
CREATE TABLE IF NOT EXISTS Prayers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NULL, -- NULL = Anónimo
    category ENUM('gracias', 'trabajo', 'intencion') NOT NULL DEFAULT 'intencion',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
