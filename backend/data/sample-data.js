const User = require('../models/user');
const Product = require('../models/product');

async function initializeSampleData() {
    try {
        console.log('开始初始化示例数据...');
        
        // 检查是否已有数据
        const existingProducts = await Product.findAll();
        if (existingProducts.length > 0) {
            console.log('示例数据已存在，跳过初始化');
            return;
        }

        // 创建示例用户
        const hashedPassword = await require('bcrypt').hash('password', 10);
        const user = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword
        });

        // 创建示例产品 - 使用有效的图片URL
        const products = [
            {
                name: '神秘盲盒 A',
                description: '包含惊喜玩具的神秘盲盒',
                price: 29.99,
                image_url: 'https://via.placeholder.com/300x300?text=Mystery+Box+A',
                stock: 10,
                user_id: user.id
            },
            {
                name: '神秘盲盒 B',
                description: '限量版收藏盲盒',
                price: 39.99,
                image_url: 'https://via.placeholder.com/300x300?text=Mystery+Box+B',
                stock: 5,
                user_id: user.id
            },
            {
                name: '神秘盲盒 C',
                description: '特别版主题盲盒',
                price: 49.99,
                image_url: 'https://via.placeholder.com/300x300?text=Mystery+Box+C',
                stock: 8,
                user_id: user.id
            }
        ];

        for (const productData of products) {
            await Product.create(productData);
        }

        console.log('示例数据初始化成功！');
    } catch (error) {
        console.error('初始化示例数据失败:', error);
    }
}

module.exports = { initializeSampleData };