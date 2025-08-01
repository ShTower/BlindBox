const User = require('../models/user');
const Product = require('../models/product');
const BlindboxItem = require('../models/blindboxItem');

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

        // 获取创建的产品
        const createdProducts = await Product.findAll();
        
        // 为每个产品创建盲盒物品
        for (const product of createdProducts) {
            const items = [
                {
                    product_id: product.id,
                    name: `${product.name} - 普通玩具`,
                    description: '常见的可爱玩具',
                    image_url: 'https://via.placeholder.com/200x200?text=Common+Toy',
                    rarity: 'common',
                    probability: 0.5
                },
                {
                    product_id: product.id,
                    name: `${product.name} - 稀有玩具`,
                    description: '稀有的精美玩具',
                    image_url: 'https://via.placeholder.com/200x200?text=Rare+Toy',
                    rarity: 'uncommon',
                    probability: 0.3
                },
                {
                    product_id: product.id,
                    name: `${product.name} - 精品玩具`,
                    description: '精美的收藏玩具',
                    image_url: 'https://via.placeholder.com/200x200?text=Epic+Toy',
                    rarity: 'rare',
                    probability: 0.15
                },
                {
                    product_id: product.id,
                    name: `${product.name} - 传说玩具`,
                    description: '极其罕见的传说级玩具',
                    image_url: 'https://via.placeholder.com/200x200?text=Legend+Toy',
                    rarity: 'legendary',
                    probability: 0.05
                }
            ];

            for (const itemData of items) {
                await BlindboxItem.create(itemData);
            }
        }

        console.log('示例数据初始化成功！包含产品和盲盒物品');
    } catch (error) {
        console.error('初始化示例数据失败:', error);
    }
}

module.exports = { initializeSampleData };