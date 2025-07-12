const db = require('../db'); 
const { update } = require('./user');

const Product = {
    create: async (productData) => {
        const {name, description,price ,stock,image_url} = productData;
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
                [name, description, price, stock, image_url],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, ...productData });
                }
            );
        });
    },

    findAll : async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM products', [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    update : async (id, productData) => {
        const { name, description, price, stock, image_url } = productData;
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?',
                [name, description, price, stock, image_url, id],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id, ...productData });
                }
            );
        });
    },

    updateStock: async (id, stock) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE products SET stock = ? WHERE id = ?',
                [stock, id],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id, stock });
                }
            );
        });
    }

}