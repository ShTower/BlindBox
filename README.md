# 🎁 盲盒抽奖机

一个现代化的盲盒抽奖网页应用，提供完整的用户注册、登录、盲盒管理、抽取和展示功能。

## ✨ 功能特性

### 🔐 用户系统
- **多用户注册登录**: 支持用户注册、登录、登出功能
- **用户认证**: 使用 Passport.js 实现安全的用户认证
- **会话管理**: 支持用户会话持久化

### 📦 盲盒管理
- **盲盒列表**: 展示所有可用的盲盒产品
- **盲盒详情**: 查看盲盒详细信息
- **盲盒搜索**: 支持按名称和描述搜索盲盒
- **库存管理**: 实时显示和更新库存数量

### 🎯 盲盒抽取
- **一键抽取**: 用户可以直接抽取盲盒
- **数量选择**: 支持选择抽取数量（1-5个）
- **库存检查**: 自动检查库存是否充足
- **即时反馈**: 抽取成功后立即更新库存

### 📋 订单系统
- **订单查看**: 用户可以查看自己的抽取记录
- **订单详情**: 显示订单的详细信息
- **历史记录**: 完整的抽取历史追踪

### 🏆 玩家秀
- **最新抽取**: 展示最新的抽取记录
- **玩家统计**: 显示今日抽取、总抽取数、参与玩家数
- **社区展示**: 让用户看到其他玩家的抽取成果

## 🛠️ 技术栈

### 后端 (Node.js)
- **Express.js**: Web 框架
- **SQLite3**: 轻量级数据库
- **Passport.js**: 用户认证
- **bcrypt**: 密码加密
- **CORS**: 跨域支持

### 前端 (React)
- **React 19**: 用户界面框架
- **React Router**: 路由管理
- **Axios**: HTTP 客户端
- **CSS3**: 现代化样式设计

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖

1. **安装后端依赖**
```bash
cd backend
npm install
```

2. **安装前端依赖**
```bash
cd frontend
npm install
```

### 启动应用

1. **启动后端服务器**
```bash
cd backend
npm run devStart
```
后端服务器将在 http://localhost:3000 启动

2. **启动前端开发服务器**
```bash
cd frontend
npm run dev
```
前端应用将在 http://localhost:5173 启动

### 访问应用

打开浏览器访问 http://localhost:5173 即可使用应用。

## 📁 项目结构

```
BlindBox/
├── backend/                 # 后端服务
│   ├── models/             # 数据模型
│   │   ├── user.js        # 用户模型
│   │   ├── product.js     # 产品模型
│   │   └── order.js       # 订单模型
│   ├── routes/            # API路由
│   │   ├── auth.js        # 认证路由
│   │   ├── products.js    # 产品路由
│   │   └── orders.js      # 订单路由
│   ├── data/              # 数据文件
│   │   └── sample-data.js # 示例数据
│   ├── database.js        # 数据库配置
│   └── server.js          # 服务器入口
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── OrderList.jsx
│   │   │   └── PlayerShow.jsx
│   │   ├── contexts/      # React上下文
│   │   │   └── AuthContext.jsx
│   │   ├── services/      # API服务
│   │   │   └── api.js
│   │   ├── home/          # 主页组件
│   │   └── App.jsx        # 应用入口
│   └── package.json
└── README.md
```

## 🔧 API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 产品接口
- `GET /api/products` - 获取盲盒列表
- `GET /api/products/:id` - 获取盲盒详情
- `POST /api/products` - 创建新盲盒
- `PUT /api/products/:id` - 更新盲盒信息
- `DELETE /api/products/:id` - 删除盲盒
- `GET /api/products/search/:keyword` - 搜索盲盒

### 订单接口
- `GET /api/orders/user/:userId` - 获取用户订单
- `POST /api/orders` - 创建订单（抽取盲盒）
- `GET /api/orders/:id` - 获取订单详情
- `GET /api/orders` - 获取所有订单

## 🎨 界面特色

- **现代化设计**: 采用渐变色彩和卡片式布局
- **响应式布局**: 完美适配桌面和移动设备
- **流畅动画**: 丰富的交互动画效果
- **用户友好**: 直观的操作界面和清晰的导航

## 🔒 安全特性

- **密码加密**: 使用 bcrypt 加密用户密码
- **会话管理**: 安全的用户会话处理
- **输入验证**: 完整的表单验证和错误处理
- **CORS 配置**: 安全的跨域请求处理

## 📱 使用流程

1. **注册/登录**: 新用户注册或已有用户登录
2. **浏览盲盒**: 在盲盒列表中查看所有可用产品
3. **搜索盲盒**: 使用搜索功能快速找到想要的盲盒
4. **查看详情**: 点击盲盒查看详细信息和价格
5. **抽取盲盒**: 选择数量并点击抽取按钮
6. **查看订单**: 在"我的订单"中查看抽取记录
7. **玩家秀**: 在"玩家秀"中查看社区抽取动态

## 🎯 开发计划

- [ ] 添加支付系统
- [ ] 实现管理员后台
- [ ] 添加用户头像功能
- [ ] 实现实时通知
- [ ] 添加更多盲盒类型
- [ ] 实现用户等级系统

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License

---

**🎉 享受你的盲盒抽取之旅！** 