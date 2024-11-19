-- script_inicial.sql

DROP TABLE IF EXISTS users;

-- Crear tabla de usuarios
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_names TEXT,
    last_names TEXT,
    email TEXT UNIQUE,
    phone_number TEXT,
    professional_career TEXT,
    semester TEXT,
    birth_date TEXT,
    dni TEXT UNIQUE,
    url_image TEXT
);

-- Insertar algunos datos de prueba
INSERT INTO users (
    first_names, 
    last_names, 
    email, 
    phone_number, 
    professional_career, 
    semester, 
    birth_date, 
    dni, 
    url_image
) VALUES (
    'FirstNames', 
    'lastNames', 
    'email@gmail.com', 
    '9998888777', 
    'Arquitectura', 
    'VII', 
    '2000-01-01',
    '10000000', 
    NULL
);


