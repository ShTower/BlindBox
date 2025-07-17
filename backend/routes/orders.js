const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { checkAuthenticated } = require('../middleware/auth');

// 创建订单（抽取盲盒）
router.post('/', checkAuthenticated, async (req, res) => {
    try {
        console.log('创建订单请求:', req.body);
        console.log('当前用户:', req.user);
        
        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.id;

        // 验证产品存在
        const product = await Product.findById(product_id);
        if (!product) {
            console.log('产品不存在:', product_id);
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('找到产品:', product);

        // 检查库存
        if (product.stock < quantity) {
            console.log('库存不足:', product.stock, '<', quantity);
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // 计算总价
        const total_price = product.price * quantity;

        // 创建订单
        const orderData = {
            user_id,
            product_id,
            quantity,
            total_price,
            order_date: new Date().toISOString()
        };

        console.log('创建订单数据:', orderData);

        const order = await Order.create(orderData);
        console.log('订单创建成功:', order);

        // 更新库存
        await Product.updateStock(product_id, product.stock - quantity);
        console.log('库存更新成功');

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: order.id,
                product: product,
                quantity: quantity,
                total_price: total_price,
                order_date: order.order_date
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 获取用户订单
router.get('/', checkAuthenticated, async (req, res) => {
    try {
        const user_id = req.user.id;
        const orders = await Order.findByUserId(user_id);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 添加新的路由：通过用户ID获取订单列表
router.get('/user/:userId', checkAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 检查用户是否有权限访问这些订单（只能访问自己的订单）
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: You can only access your own orders' });
        }
        
        const orders = await Order.findByUserId(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;