const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { checkAuthenticated } = require('../middleware/auth');

// 创建订单（抽取盲盒）
router.post('/', checkAuthenticated, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.id;

        // 验证产品存在
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 检查库存
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // 计算总价
        const total_price = product.price * quantity;

        // 创建订单
        const order = await Order.create({
            user_id,
            product_id,
            quantity,
            total_price,
            order_date: new Date().toISOString()
        });

        // 更新库存
        await Product.updateStock(product_id, product.stock - quantity);

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

module.exports = router;