const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');

if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
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
            image_url TEXT,
            stock INTEGER DEFAULT 0,
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
            total_price REAL NOT NULL,
            order_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table:', err.message);
            } else {
                console.log('Orders table created or already exists.');
            }
        });

        // 创建玩家秀表
        db.run(`CREATE TABLE IF NOT EXISTS player_shows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            image_url TEXT,
            order_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            likes_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating player_shows table:', err.message);
            } else {
                console.log('Player_shows table created or already exists.');
            }
        });

        // 创建评论表
        db.run(`CREATE TABLE IF NOT EXISTS show_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            show_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (show_id) REFERENCES player_shows(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating show_comments table:', err.message);
            } else {
                console.log('Show_comments table created or already exists.');
            }
        });

        // 创建点赞表
        db.run(`CREATE TABLE IF NOT EXISTS show_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            show_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(show_id, user_id),
            FOREIGN KEY (show_id) REFERENCES player_shows(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating show_likes table:', err.message);
            } else {
                console.log('Show_likes table created or already exists.');
            }
        });

        // 检查并添加缺失的字段
        db.run(`ALTER TABLE orders ADD COLUMN total_price REAL`, (err) => {
            if (err) {
                // 如果字段已存在，会报错，我们忽略这个错误
                if (err.message.includes('duplicate column name')) {
                    console.log('total_price column already exists');
                } else {
                    console.log('Added total_price column to orders table');
                }
            } else {
                console.log('Added total_price column to orders table');
            }
        });

        // 检查并修改 order_date 字段默认值
        db.run(`UPDATE orders SET order_date = CURRENT_TIMESTAMP WHERE order_date IS NULL`, (err) => {
            if (err) {
                console.error('Error updating order_date:', err.message);
            }
        });
        
        // 使用 setTimeout 确保所有表都创建完成后再初始化数据
        setTimeout(() => {
            console.log('Database initialization complete.');
            const { initializeSampleData } = require('./data/sample-data');
            initializeSampleData();
        }, 200);
    });
}

module.exports = db;