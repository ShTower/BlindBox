const Product = require('../models/product');

const sampleProducts = [
    {
        name: "神秘手办盲盒",
        description: "精美手办系列，包含多种稀有角色，每个盲盒都有惊喜！",
        price: 29.99,
        stock: 50,
        image_url: "https://via.placeholder.com/300x300/667eea/ffffff?text=手办盲盒"
    },
    {
        name: "潮玩积木盲盒",
        description: "创意积木系列，拼装乐趣无穷，收藏价值极高！",
        price: 39.99,
        stock: 30,
        image_url: "https://via.placeholder.com/300x300/764ba2/ffffff?text=积木盲盒"
    },
    {
        name: "动漫周边盲盒",
        description: "热门动漫IP正版授权，精美周边等你来抽！",
        price: 19.99,
        stock: 100,
        image_url: "https://via.placeholder.com/300x300/e74c3c/ffffff?text=动漫盲盒"
    },
    {
        name: "科技数码盲盒",
        description: "最新科技产品，数码爱好者的最爱！",
        price: 59.99,
        stock: 20,
        image_url: "https://via.placeholder.com/300x300/27ae60/ffffff?text=数码盲盒"
    },
    {
        name: "美食零食盲盒",
        description: "精选各地美食，零食爱好者的天堂！",
        price: 15.99,
        stock: 80,
        image_url: "https://via.placeholder.com/300x300/f39c12/ffffff?text=美食盲盒"
    },
    {
        name: "时尚配饰盲盒",
        description: "潮流配饰系列，提升你的时尚品味！",
        price: 25.99,
        stock: 60,
        image_url: "https://via.placeholder.com/300x300/9b59b6/ffffff?text=配饰盲盒"
    }
];

const initializeSampleData = async () => {
    try {
        console.log('开始初始化示例数据...');
        
        for (const productData of sampleProducts) {
            await Product.create(productData);
            console.log(`创建产品: ${productData.name}`);
        }
        
        console.log('示例数据初始化完成！');
    } catch (error) {
        console.error('初始化示例数据失败:', error);
    }
};

module.exports = { initializeSampleData }; 