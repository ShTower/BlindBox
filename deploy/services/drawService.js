const BlindboxItem = require('../models/blindboxItem');
const DrawResult = require('../models/drawResult');

class DrawService {
    // 执行盲盒抽取
    static async performDraw(product_id, user_id, order_id, quantity = 1) {
        try {
            // 获取该产品的所有物品
            const items = await BlindboxItem.findByProductId(product_id);
            
            if (!items || items.length === 0) {
                throw new Error('该盲盒暂无可抽取物品');
            }

            // 验证概率总和
            const totalProbability = items.reduce((sum, item) => sum + item.probability, 0);
            if (totalProbability <= 0) {
                throw new Error('物品概率配置错误');
            }

            const results = [];

            // 执行多次抽取
            for (let i = 0; i < quantity; i++) {
                const drawnItem = this.drawRandomItem(items, totalProbability);
                
                // 保存抽取结果
                const result = await DrawResult.create({
                    order_id,
                    item_id: drawnItem.id,
                    user_id
                });

                results.push({
                    ...result,
                    item: drawnItem
                });
            }

            return results;
        } catch (error) {
            console.error('抽取失败:', error);
            throw error;
        }
    }

    // 随机抽取一个物品
    static drawRandomItem(items, totalProbability) {
        const random = Math.random() * totalProbability;
        let currentSum = 0;

        for (const item of items) {
            currentSum += item.probability;
            if (random <= currentSum) {
                return item;
            }
        }

        // 如果因为浮点数精度问题没有选中任何物品，返回最后一个
        return items[items.length - 1];
    }

    // 获取用户的抽取历史
    static async getUserDrawHistory(user_id) {
        try {
            return await DrawResult.findByUserId(user_id);
        } catch (error) {
            console.error('获取抽取历史失败:', error);
            throw error;
        }
    }

    // 获取订单的抽取结果
    static async getOrderDrawResults(order_id) {
        try {
            return await DrawResult.findByOrderId(order_id);
        } catch (error) {
            console.error('获取订单抽取结果失败:', error);
            throw error;
        }
    }

    // 获取物品稀有度的颜色样式
    static getRarityColor(rarity) {
        const rarityColors = {
            'common': '#95a5a6',     // 灰色
            'uncommon': '#27ae60',   // 绿色
            'rare': '#3498db',       // 蓝色
            'epic': '#9b59b6',       // 紫色
            'legendary': '#f39c12',  // 橙色
            'mythic': '#e74c3c'      // 红色
        };
        return rarityColors[rarity] || rarityColors['common'];
    }

    // 获取稀有度的中文名称
    static getRarityName(rarity) {
        const rarityNames = {
            'common': '普通',
            'uncommon': '稀有',
            'rare': '精品',
            'epic': '史诗',
            'legendary': '传说',
            'mythic': '神话'
        };
        return rarityNames[rarity] || '普通';
    }
}

module.exports = DrawService;
