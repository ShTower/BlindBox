const express = require('express');
const Product = require('../models/product');
const router = express.Router();

// 获取所有盲盒列表
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let products = await Product.findAll();
        
        // 搜索功能 - 改进搜索逻辑
        if (search && search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            products = products.filter(product => 
                (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }
        
        // 分页
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        res.json({
            products: paginatedProducts,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(products.length / limitNum),
                totalItems: products.length,
                hasNext: endIndex < products.length,
                hasPrev: pageNum > 1
            }
        });
    } catch (error) {
        console.error('获取产品列表错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取单个盲盒详情
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: '盲盒不存在' });
        }
        res.json({ product });
    } catch (error) {
        console.error('获取产品详情错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建新盲盒（需要管理员权限）
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock, image_url } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: '名称和价格是必填项' });
        }
        
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            image_url
        });
        
        res.status(201).json({
            message: '盲盒创建成功',
            product
        });
    } catch (error) {
        console.error('创建产品错误:', error);
        res.status(500).json({ 
            error: '服务器错误', 
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 更新盲盒信息（需要管理员权限）
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, stock, image_url } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: '盲盒不存在' });
        }
        
        const updatedProduct = await Product.update(req.params.id, {
            name: name !== undefined ? name : product.name,
            description: description !== undefined ? description : product.description,
            price: price !== undefined ? parseFloat(price) : product.price,
            stock: stock !== undefined ? parseInt(stock) : product.stock,
            image_url: image_url !== undefined ? image_url : product.image_url
        });
        
        res.json({
            message: '盲盒更新成功',
            product: updatedProduct
        });
    } catch (error) {
        console.error('更新产品错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除盲盒（需要管理员权限）
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: '盲盒不存在' });
        }
        
        await Product.delete(req.params.id);
        res.json({ message: '盲盒删除成功' });
    } catch (error) {
        console.error('删除产品错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router; 