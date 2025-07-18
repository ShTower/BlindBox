const db = require('../database');

const Product = {
    create: (productData) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO products (name, description, price, image_url, stock, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    productData.name, 
                    productData.description, 
                    productData.price, 
                    productData.image_url, 
                    productData.stock, 
                    productData.user_id || null
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...productData });
                    }
                }
            );
        });
    },

    findAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM products', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },
    update: (id, productData) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?',
                [
                    productData.name,
                    productData.description,
                    productData.price,
                    productData.stock,
                    productData.image_url,
                    id
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...productData });
                    }
                }
            );
        });
    },

    updateStock: (id, newStock) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE products SET stock = ? WHERE id = ?',
                [newStock, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }
};

module.exports = Product;