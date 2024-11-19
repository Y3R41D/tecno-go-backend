-- Migration number: 0001 	 2024-11-08T05:01:03.974Z
CREATE TABLE users (
    dni TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone_number TEXT,
    professional_career TEXT,
    semester TEXT,
    birth_date TEXT,
    url_image TEXT
);

