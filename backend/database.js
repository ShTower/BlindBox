const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');

if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath ,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
        initializeTables();
    }
});

function initializeTables(){
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,           -- 商品图片
            stock INTEGER DEFAULT 0,  -- 库存
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating products table:', err.message);
            } else {
                console.log('Products table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            order_date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table:', err.message);
            } else {
                console.log('Orders table created or already exists.');
            }
        });
        db.close(); 
        console.log('Database initialization complete.');
        
    })
}