const db = require('../database');

const BlindboxItem = {
    // 创建盲盒物品
    create: (itemData) => {
        return new Promise((resolve, reject) => {
            const { product_id, name, description, image_url, rarity, probability } = itemData;
            db.run(
                'INSERT INTO blindbox_items (product_id, name, description, image_url, rarity, probability) VALUES (?, ?, ?, ?, ?, ?)',
                [product_id, name, description, image_url, rarity, probability],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...itemData });
                    }
                }
            );
        });
    },

    // 根据产品ID获取所有物品
    findByProductId: (product_id) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM blindbox_items WHERE product_id = ? ORDER BY probability DESC',
                [product_id],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    },

    // 根据ID获取物品
    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM blindbox_items WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    // 更新物品
    update: (id, itemData) => {
        return new Promise((resolve, reject) => {
            const { name, description, image_url, rarity, probability } = itemData;
            db.run(
                'UPDATE blindbox_items SET name = ?, description = ?, image_url = ?, rarity = ?, probability = ? WHERE id = ?',
                [name, description, image_url, rarity, probability, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...itemData });
                    }
                }
            );
        });
    },

    // 删除物品
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM blindbox_items WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    },

    // 获取所有物品
    findAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM blindbox_items ORDER BY product_id, probability DESC', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
};

module.exports = BlindboxItem;
