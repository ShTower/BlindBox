const express = require('express');
const router = express.Router();
const PlayerShow = require('../models/playerShow');
const { checkAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// 获取所有玩家秀
router.get('/', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const userId = req.user ? req.user.id : null;
        const shows = await PlayerShow.findAll({ 
            limit: parseInt(limit), 
            offset: parseInt(offset),
            userId
        });
        
        res.json({
            success: true,
            data: {
                shows: shows
            }
        });
    } catch (error) {
        console.error('获取玩家秀失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取玩家秀失败' 
        });
    }
});

// 创建玩家秀
router.post('/', checkAuthenticated, async (req, res) => {
    try {
        const { title, content, image_url } = req.body;
        const user_id = req.user.id;

        console.log('📝 收到创建玩家秀请求:', { user_id, title, content, image_url });

        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                error: '标题和内容不能为空' 
            });
        }

        const show = await PlayerShow.create({
            user_id,
            title,
            content,
            image_url: image_url || null
        });

        console.log('✅ 玩家秀创建成功:', show);

        res.status(201).json({
            success: true,
            message: '玩家秀发表成功',
            data: { show }
        });
    } catch (error) {
        console.error('❌ 创建玩家秀失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '创建玩家秀失败' 
        });
    }
});

// 上传图片
router.post('/upload', checkAuthenticated, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: '没有上传文件' 
            });
        }

        // 返回完整的图片URL路径
        const imageUrl = `/uploads/${req.file.filename}`;
        
        console.log('图片上传成功:', {
            filename: req.file.filename,
            path: req.file.path,
            imageUrl: imageUrl
        });
        
        res.json({
            success: true,
            data: {
                imageUrl: imageUrl
            }
        });
    } catch (error) {
        console.error('上传图片失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '上传图片失败' 
        });
    }
});

// 获取玩家秀评论
router.get('/:id/comments', async (req, res) => {
    try {
        const showId = req.params.id;
        const comments = await PlayerShow.getComments(showId);
        
        res.json({
            success: true,
            data: { comments }
        });
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取评论失败' 
        });
    }
});

// 添加评论
router.post('/:id/comments', checkAuthenticated, async (req, res) => {
    try {
        const showId = req.params.id;
        const { content } = req.body;
        const user_id = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: '评论内容不能为空' 
            });
        }

        const comment = await PlayerShow.addComment(showId, {
            user_id,
            content: content.trim()
        });

        res.status(201).json({
            success: true,
            message: '评论成功',
            data: { comment }
        });
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '添加评论失败' 
        });
    }
});

// 点赞
router.post('/:id/like', checkAuthenticated, async (req, res) => {
    try {
        const showId = req.params.id;
        const userId = req.user.id;

        await PlayerShow.like(showId, userId);
        
        res.json({
            success: true,
            message: '点赞成功'
        });
    } catch (error) {
        console.error('点赞失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '点赞失败' 
        });
    }
});

// 取消点赞
router.delete('/:id/like', checkAuthenticated, async (req, res) => {
    try {
        const showId = req.params.id;
        const userId = req.user.id;

        await PlayerShow.unlike(showId, userId);
        
        res.json({
            success: true,
            message: '取消点赞成功'
        });
    } catch (error) {
        console.error('取消点赞失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '取消点赞失败' 
        });
    }
});

module.exports = router;
