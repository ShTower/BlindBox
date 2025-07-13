import React from 'react'
import './App.css'
import { Register } from './Register';
import { Login } from './Login';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './home/home.jsx';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import OrderList from './components/OrderList';
import PlayerShow from './components/PlayerShow';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* /home 作为父路由，Home 作为布局组件 */}
        <Route path="/home" element={<Home />}>
          {/* 默认子路由（访问 /home 时显示的内容） */}
          <Route index element={
            <div className="welcome-section">
              <h1>🎁 欢迎来到盲盒抽奖机</h1>
              <p>在这里，每一次抽取都充满惊喜！</p>
              <div className="feature-grid">
                <div className="feature-card">
                  <h3>🎯 精选盲盒</h3>
                  <p>多种精美盲盒等你来抽取</p>
                </div>
                <div className="feature-card">
                  <h3>📦 即时发货</h3>
                  <p>抽取成功后立即发货</p>
                </div>
                <div className="feature-card">
                  <h3>🏆 玩家秀</h3>
                  <p>展示你的抽取成果</p>
                </div>
                <div className="feature-card">
                  <h3>💎 稀有奖励</h3>
                  <p>有机会获得稀有物品</p>
                </div>
              </div>
            </div>
          } />
          
          {/* 显式声明的子路由 */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="products" element={<ProductList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="show" element={<PlayerShow />} />
          
          {/* 动态路由 */}
          <Route path="product/:id" element={<ProductDetail />} />
        </Route>
        
        {/* 根路径重定向 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App
