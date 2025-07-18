const db = require('../database');

const DrawResult = {
    // 创建抽取结果
    create: (resultData) => {
        return new Promise((resolve, reject) => {
            const { order_id, item_id, user_id } = resultData;
            db.run(
                'INSERT INTO draw_results (order_id, item_id, user_id) VALUES (?, ?, ?)',
                [order_id, item_id, user_id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...resultData });
                    }
                }
            );
        });
    },

    // 根据订单ID获取抽取结果
    findByOrderId: (order_id) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT dr.*, bi.name as item_name, bi.description as item_description, 
                        bi.image_url as item_image_url, bi.rarity as item_rarity
                 FROM draw_results dr
                 JOIN blindbox_items bi ON dr.item_id = bi.id
                 WHERE dr.order_id = ?`,
                [order_id],
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

    // 根据用户ID获取所有抽取结果
    findByUserId: (user_id) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT dr.*, bi.name as item_name, bi.description as item_description, 
                        bi.image_url as item_image_url, bi.rarity as item_rarity,
                        o.order_date, p.name as product_name
                 FROM draw_results dr
                 JOIN blindbox_items bi ON dr.item_id = bi.id
                 JOIN orders o ON dr.order_id = o.id
                 JOIN products p ON bi.product_id = p.id
                 WHERE dr.user_id = ?
                 ORDER BY dr.created_at DESC`,
                [user_id],
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

    // 根据ID获取抽取结果
    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT dr.*, bi.name as item_name, bi.description as item_description, 
                        bi.image_url as item_image_url, bi.rarity as item_rarity
                 FROM draw_results dr
                 JOIN blindbox_items bi ON dr.item_id = bi.id
                 WHERE dr.id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    // 获取用户某个物品的数量
    getUserItemCount: (user_id, item_id) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM draw_results WHERE user_id = ? AND item_id = ?',
                [user_id, item_id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.count);
                    }
                }
            );
        });
    }
};

module.exports = DrawResult;
