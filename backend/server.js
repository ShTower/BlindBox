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

// 导入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

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
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}))

// CORS配置
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(passport.initialize())
app.use(passport.session())

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/api/health`);
});