const db = require('../database');

const Order = {
    create : async (orderData) => {
        const { user_id, product_id, quantity, total_price, order_date } = orderData;
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO orders (user_id, product_id, quantity, total_price, order_date) VALUES (?, ?, ?, ?, ?)',
                [user_id, product_id, quantity, total_price, order_date],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, ...orderData });
                }
            );
        });
    },

    addItem: async (orderData) => {
        const { user_id, product_id, quantity, total_price } = orderData;
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO order_items (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
                [user_id, product_id, quantity, total_price],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, ...orderData });
                }
            );
        });
    },

    findByUserId : async (user_id) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM orders WHERE user_id = ?', [user_id], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    findById: async (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    },

    findAll: async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM orders', (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
};

module.exports = Order;