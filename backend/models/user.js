const db = require('../database')

const User = {
    create: async (userData) => {
        const { username, email, password_hash } = userData;
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        return new Promise((resolve , reject) => {
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password_hash],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, ...userData });
                }
            );
        });
    },

    findById: async (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    findByUsername: async (username) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    },

    findByEmail: async (email) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    update: async (id, userData) => {
        const { username, email, password_hash } = userData;
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
                [username, email, password_hash, id],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this.changess});
                }
            );
        });
    },
};

module.exports = User;