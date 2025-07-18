const BlindboxItem = require('./models/blindboxItem');

async function addItemsForTestProduct() {
    const items = [
        {
            product_id: 5,
            name: '测试商品 - 普通奖品',
            description: '常见的可爱奖品',
            image_url: 'https://via.placeholder.com/200x200?text=Common+Item',
            rarity: 'common',
            probability: 0.5
        },
        {
            product_id: 5,
            name: '测试商品 - 稀有奖品',
            description: '稀有的精美奖品',
            image_url: 'https://via.placeholder.com/200x200?text=Rare+Item',
            rarity: 'uncommon',
            probability: 0.3
        },
        {
            product_id: 5,
            name: '测试商品 - 精品奖品',
            description: '精美的收藏奖品',
            image_url: 'https://via.placeholder.com/200x200?text=Epic+Item',
            rarity: 'rare',
            probability: 0.15
        },
        {
            product_id: 5,
            name: '测试商品 - 传说奖品',
            description: '极其罕见的传说级奖品',
            image_url: 'https://via.placeholder.com/200x200?text=Legend+Item',
            rarity: 'legendary',
            probability: 0.05
        }
    ];

    try {
        for (const item of items) {
            await BlindboxItem.create(item);
            console.log(`创建物品成功: ${item.name}`);
        }
        console.log('为测试商品添加盲盒物品成功！');
        process.exit(0);
    } catch (error) {
        console.error('添加失败:', error);
        process.exit(1);
    }
}

addItemsForTestProduct();
