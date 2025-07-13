const db = require('../database');

const User = {
    create: async (userData) => {
        const { username, email, password } = userData;
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, username, email });
                }
            );
        });
    },

    findById: async (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
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
                resolve(row || null);
            });
        });
    },

    findAll: async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, username, email FROM users', (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    update: async (id, userData) => {
        const { username, email, password } = userData;
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
                [username, email, password, id],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this.changes });
                }
            );
        });
    },

    delete: async (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ changes: this.changes });
            });
        });
    },

    updatePassword: async (id, newPassword) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [newPassword, id],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this.changes });
                }
            );
        });
    }
};

module.exports = User;