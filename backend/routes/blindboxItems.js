const express = require('express');
const router = express.Router();
const BlindboxItem = require('../models/blindboxItem');
const { checkAuthenticated } = require('../middleware/auth');

// 获取所有盲盒物品
router.get('/', async (req, res) => {
    try {
        const items = await BlindboxItem.findAll();
        res.json(items);
    } catch (error) {
        console.error('Get blindbox items error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 根据产品ID获取盲盒物品
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const items = await BlindboxItem.findByProductId(productId);
        res.json(items);
    } catch (error) {
        console.error('Get product items error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 创建盲盒物品（需要管理员权限）
router.post('/', checkAuthenticated, async (req, res) => {
    try {
        const { product_id, name, description, image_url, rarity, probability } = req.body;
        
        // 验证必需字段
        if (!product_id || !name || !rarity || !probability) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 验证概率值
        if (probability <= 0 || probability > 1) {
            return res.status(400).json({ error: 'Probability must be between 0 and 1' });
        }

        const itemData = {
            product_id,
            name,
            description: description || '',
            image_url: image_url || '',
            rarity,
            probability
        };

        const item = await BlindboxItem.create(itemData);
        res.status(201).json({
            message: 'Blindbox item created successfully',
            item
        });
    } catch (error) {
        console.error('Create blindbox item error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 更新盲盒物品
router.put('/:id', checkAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url, rarity, probability } = req.body;

        // 验证概率值
        if (probability !== undefined && (probability <= 0 || probability > 1)) {
            return res.status(400).json({ error: 'Probability must be between 0 and 1' });
        }

        const itemData = {
            name,
            description,
            image_url,
            rarity,
            probability
        };

        const item = await BlindboxItem.update(id, itemData);
        res.json({
            message: 'Blindbox item updated successfully',
            item
        });
    } catch (error) {
        console.error('Update blindbox item error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 删除盲盒物品
router.delete('/:id', checkAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await BlindboxItem.delete(id);
        res.json({ message: 'Blindbox item deleted successfully' });
    } catch (error) {
        console.error('Delete blindbox item error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
