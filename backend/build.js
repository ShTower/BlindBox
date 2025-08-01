const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始构建单文件应用...');

// 1. 构建前端
console.log('📦 构建前端应用...');
try {
    process.chdir(path.join(__dirname, '../frontend'));
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 前端构建完成');
} catch (error) {
    console.error('❌ 前端构建失败:', error.message);
    process.exit(1);
}

// 2. 返回后端目录
process.chdir(__dirname);

// 3. 创建部署目录
const deployDir = path.join(__dirname, '../deploy');
console.log('📁 创建部署目录...');

if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// 4. 复制后端文件
console.log('📋 复制后端文件...');
const backendFiles = [
    'server.js',
    'database.js',
    'passport-config.js',
    'package.json',
    'database.db'
];

const backendDirs = [
    'models',
    'routes',
    'services',
    'middleware',
    'data',
    'uploads'
];

// 复制文件
backendFiles.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(deployDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ 复制文件: ${file}`);
    } else {
        console.log(`  ⚠️  文件不存在: ${file}`);
    }
});

// 复制目录
function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`  ⚠️  目录不存在: ${src}`);
        return;
    }
    
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (fs.statSync(srcFile).isDirectory()) {
            copyDirectory(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

backendDirs.forEach(dir => {
    const srcPath = path.join(__dirname, dir);
    const destPath = path.join(deployDir, dir);
    copyDirectory(srcPath, destPath);
    console.log(`  ✅ 复制目录: ${dir}`);
});

// 5. 复制前端构建文件
console.log('🌐 复制前端构建文件...');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const deployFrontendPath = path.join(deployDir, 'frontend/dist');

if (fs.existsSync(frontendDistPath)) {
    copyDirectory(frontendDistPath, deployFrontendPath);
    console.log('  ✅ 前端文件复制完成');
} else {
    console.error('  ❌ 前端构建文件不存在，请先运行前端构建');
    process.exit(1);
}

// 6. 复制管理后台
console.log('👨‍💼 复制管理后台文件...');
const adminPath = path.join(__dirname, '../admin');
const deployAdminPath = path.join(deployDir, 'admin');

if (fs.existsSync(adminPath)) {
    copyDirectory(adminPath, deployAdminPath);
    console.log('  ✅ 管理后台文件复制完成');
}

// 7. 创建环境文件
console.log('⚙️ 创建环境配置...');
const envContent = `NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
`;

fs.writeFileSync(path.join(deployDir, '.env'), envContent);
console.log('  ✅ 环境配置文件创建完成');

// 8. 创建启动脚本
console.log('🎯 创建启动脚本...');
const startScript = `#!/usr/bin/env node

console.log('🎮 盲盒抽奖系统启动中...');
console.log('');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 启动服务器
require('./server.js');

// 输出启动信息
setTimeout(() => {
    console.log('');
    console.log('🎉 系统启动完成！');
    console.log('');
    console.log('📱 用户界面: http://localhost:3000');
    console.log('👨‍💼 管理后台: http://localhost:3000/admin');
    console.log('🔧 API接口: http://localhost:3000/api/health');
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
}, 1000);
`;

fs.writeFileSync(path.join(deployDir, 'start.js'), startScript);
console.log('  ✅ 启动脚本创建完成');

// 9. 创建说明文件
console.log('📖 创建使用说明...');
const readmeContent = `# 盲盒抽奖系统 - 单文件部署版

## 🚀 快速开始

### 1. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 2. 启动应用
\`\`\`bash
node start.js
\`\`\`

或者使用npm：
\`\`\`bash
npm start
\`\`\`

### 3. 访问应用
- 🌐 用户界面: http://localhost:3000
- 👨‍💼 管理后台: http://localhost:3000/admin
- 🔧 API接口: http://localhost:3000/api/health

## 📁 文件结构

\`\`\`
deploy/
├── server.js              # 主服务器文件
├── start.js               # 启动脚本
├── package.json           # 项目配置
├── database.db            # SQLite数据库
├── .env                   # 环境配置
├── models/                # 数据模型
├── routes/                # API路由
├── services/              # 业务逻辑
├── middleware/            # 中间件
├── data/                  # 数据文件
├── uploads/               # 上传文件
├── frontend/dist/         # 前端构建文件
└── admin/                 # 管理后台
\`\`\`

## 🔧 技术栈

- **后端**: Node.js + Express.js
- **前端**: React + Vite
- **数据库**: SQLite（嵌入式）
- **认证**: Passport.js
- **文件上传**: Multer

## 📝 功能特点

- ✅ 用户注册登录
- ✅ 商品管理
- ✅ 盲盒抽取
- ✅ 订单管理
- ✅ 玩家秀
- ✅ 管理后台
- ✅ 单文件部署

## 🛠️ 开发模式

如果需要开发，请回到原项目目录：
\`\`\`bash
# 后端开发
cd backend
npm run dev

# 前端开发
cd frontend
npm run dev
\`\`\`

## 📞 技术支持

如有问题，请检查：
1. Node.js版本 >= 14
2. 端口3000是否被占用
3. 数据库文件权限是否正确

---
构建时间: ${new Date().toLocaleString()}
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);
console.log('  ✅ 使用说明创建完成');

// 10. 完成
console.log('');
console.log('🎉 构建完成！');
console.log('');
console.log('📁 部署目录:', deployDir);
console.log('');
console.log('🚀 运行应用:');
console.log('  cd deploy');
console.log('  npm install');
console.log('  node start.js');
console.log('');
