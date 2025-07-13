const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 检查用户是否已存在
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: '邮箱已被注册' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: '注册成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登录
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({
        message: '登录成功',
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

// 用户登出
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: '登出失败' });
        }
        res.json({ message: '登出成功' });
    });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: '未登录' });
    }
    
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

module.exports = router; 