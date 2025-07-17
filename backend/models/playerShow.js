const db = require('../database');

const PlayerShow = {
    create: async (showData) => {
        const { user_id, title, content, image_url } = showData;
        console.log('📝 创建玩家秀数据:', showData);
        
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO player_shows (user_id, title, content, image_url) VALUES (?, ?, ?, ?)',
                [user_id, title, content, image_url || null],
                function(err) {
                    if (err) {
                        console.error('❌ 创建玩家秀失败:', err);
                        return reject(err);
                    }
                    console.log('✅ 玩家秀创建成功，ID:', this.lastID);
                    resolve({ id: this.lastID, ...showData });
                }
            );
        });
    },

    findAll: async (options = {}) => {
        const { limit = 20, offset = 0, userId } = options;
        console.log('🔍 查询玩家秀，参数:', { limit, offset, userId });
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ps.id,
                    ps.user_id,
                    ps.title,
                    ps.content,
                    ps.image_url,
                    ps.created_at,
                    u.username,
                    (SELECT COUNT(*) FROM show_comments WHERE show_id = ps.id) as comments_count,
                    (SELECT COUNT(*) FROM show_likes WHERE show_id = ps.id) as likes_count
                FROM player_shows ps
                LEFT JOIN users u ON ps.user_id = u.id
                ORDER BY ps.created_at DESC
                LIMIT ? OFFSET ?
            `;
            db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    console.error('❌ 查询玩家秀失败:', err);
                    return reject(err);
                }
                if (userId) {
                    // 批量查找所有 show id
                    const showIds = rows.map(r => r.id);
                    if (showIds.length === 0) {
                        resolve([]);
                        return;
                    }
                    // 查询该用户点赞了哪些 show
                    const likeSql = `SELECT show_id FROM show_likes WHERE user_id = ? AND show_id IN (${showIds.map(()=>'?').join(',')})`;
                    db.all(likeSql, [userId, ...showIds], (likeErr, likeRows) => {
                        if (likeErr) return reject(likeErr);
                        const likedSet = new Set(likeRows.map(lr => lr.show_id));
                        rows.forEach(row => row.user_liked = likedSet.has(row.id));
                        resolve(rows);
                    });
                } else {
                    rows.forEach(row => row.user_liked = false);
                    resolve(rows);
                }
            });
        });
    },

    findById: async (id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ps.*,
                    u.username,
                    (SELECT COUNT(*) FROM show_comments WHERE show_id = ps.id) as comments_count,
                    (SELECT COUNT(*) FROM show_likes WHERE show_id = ps.id) as likes_count
                FROM player_shows ps
                LEFT JOIN users u ON ps.user_id = u.id
                WHERE ps.id = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    // 获取评论
    getComments: async (showId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    sc.*,
                    u.username
                FROM show_comments sc
                LEFT JOIN users u ON sc.user_id = u.id
                WHERE sc.show_id = ?
                ORDER BY sc.created_at ASC
            `;
            db.all(sql, [showId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    // 添加评论
    addComment: async (showId, commentData) => {
        const { user_id, content } = commentData;
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO show_comments (show_id, user_id, content) VALUES (?, ?, ?)',
                [showId, user_id, content],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: this.lastID, show_id: showId, user_id, content });
                }
            );
        });
    },

    // 点赞
    like: async (showId, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO show_likes (show_id, user_id) VALUES (?, ?)',
                [showId, userId],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this.changes });
                }
            );
        });
    },

    // 取消点赞
    unlike: async (showId, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM show_likes WHERE show_id = ? AND user_id = ?',
                [showId, userId],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ changes: this.changes });
                }
            );
        });
    },

    // 检查用户是否已点赞
    isLiked: async (showId, userId) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT 1 FROM show_likes WHERE show_id = ? AND user_id = ?',
                [showId, userId],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(!!row);
                }
            );
        });
    }
};

module.exports = PlayerShow;
