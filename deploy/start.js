#!/usr/bin/env node

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
