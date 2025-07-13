const express = require('express');
const Order = require('../models/order');
const Product = require('../models/product');
const router = express.Router();

// 获取用户订单列表
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.findByUserId(req.params.userId);
        res.json({ orders });
    } catch (error) {
        console.error('获取订单列表错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建新订单（盲盒抽取）
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id, quantity = 1 } = req.body;
        
        // 获取产品信息
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ error: '盲盒不存在' });
        }
        
        // 检查库存
        if (product.stock < quantity) {
            return res.status(400).json({ error: '库存不足' });
        }
        
        // 计算总价
        const total_price = product.price * quantity;
        
        // 创建订单
        const order = await Order.create({
            user_id,
            product_id,
            quantity,
            total_price
        });
        
        // 更新库存
        await Product.updateStock(product_id, product.stock - quantity);
        
        res.status(201).json({
            message: '盲盒抽取成功',
            order,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url
            }
        });
    } catch (error) {
        console.error('创建订单错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }
        res.json({ order });
    } catch (error) {
        console.error('获取订单详情错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取所有订单（管理员功能）
router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json({ orders });
    } catch (error) {
        console.error('获取所有订单错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router; 