const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const DrawService = require('../services/drawService');
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

        // 执行盲盒抽取
        let drawResults = [];
        try {
            drawResults = await DrawService.performDraw(product_id, user_id, order.id, quantity);
            console.log('抽取成功:', drawResults);
        } catch (drawError) {
            console.error('抽取失败:', drawError);
            // 即使抽取失败，订单仍然有效，但需要通知用户
        }

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: order.id,
                product: product,
                quantity: quantity,
                total_price: total_price,
                order_date: order.order_date
            },
            drawResults: drawResults
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

// 获取订单的抽取结果
router.get('/:orderId/results', checkAuthenticated, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // 验证订单属于当前用户
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: You can only access your own orders' });
        }
        
        const results = await DrawService.getOrderDrawResults(orderId);
        res.json(results);
    } catch (error) {
        console.error('Get order results error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 获取用户的抽取历史
router.get('/results/history', checkAuthenticated, async (req, res) => {
    try {
        const user_id = req.user.id;
        const history = await DrawService.getUserDrawHistory(user_id);
        res.json(history);
    } catch (error) {
        console.error('Get draw history error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;