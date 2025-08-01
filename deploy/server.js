if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const cors = require('cors')
const path = require('path')

// 导入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const playerShowRoutes = require('./routes/playerShow'); // 添加玩家秀路由
const blindboxItemRoutes = require('./routes/blindboxItems'); // 添加盲盒物品路由

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    async (email) => {
        const User = require('./models/user');
        return await User.findByEmail(email);
    }
)

app.set('view engine', 'ejs')
app.use(express.json()) // 支持JSON请求体
app.use(express.urlencoded({ extended: false }))
app.use(flash())

// CORS配置 - 必须在session之前
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000'  // 允许管理界面访问
    ],
    credentials: true
}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // 开发环境设为false
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}))

app.use(passport.initialize())
app.use(passport.session())

// 静态文件服务 - 用于提供上传的图片
app.use('/uploads', (req, res, next) => {
    console.log('静态文件请求:', req.path);
    next();
}, express.static(path.join(__dirname, 'uploads')));

// 提供管理员页面静态文件
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// 提供前端构建文件（单文件构建模式）
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/player-shows', playerShowRoutes); // 注册玩家秀路由
app.use('/api/blindbox-items', blindboxItemRoutes); // 注册盲盒物品路由

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: '盲盒抽奖机API服务运行正常' });
});

// 传统页面路由（保留用于管理后台）
app.get('/', (req, res) => {
    res.render('index.ejs', { name: 'BlindBox' })
})

app.get('/login', (req, res) => {
    res.render('login.ejs', { name: 'BlindBox' })
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', (req, res) => {
    res.render('register.ejs', { name: 'BlindBox' })
})

app.post('/register', async (req, res) => {
    try {
        const User = require('./models/user');
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            username: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        console.error('注册错误:', error);
        res.redirect('/register')
    }
})

// SPA路由处理 - 将所有非API请求重定向到前端应用
app.get('*', (req, res) => {
    // 如果是API请求，返回404
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    // 否则返回前端应用
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/api/health`);
});