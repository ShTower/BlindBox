import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductList from '../components/ProductList';
import OrderList from '../components/OrderList';
import PlayerShow from '../components/PlayerShow';
import './home.css';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/home/login');
        }
    };

    return (
        <div className="home-container">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <h1>🎁 盲盒抽奖机</h1>
                    </div>
                    
                    <nav className="nav-menu">
                        <Link to="/home" className="nav-link">首页</Link>
                        <Link to="/home/products" className="nav-link">盲盒列表</Link>
                        <Link to="/home/orders" className="nav-link">我的订单</Link>
                        <Link to="/home/show" className="nav-link">玩家秀</Link>
                    </nav>
                    
                    <div className="user-section">
                        {user ? (
                            <div className="user-info">
                                <span className="username">欢迎, {user.username}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    登出
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/home/login" className="auth-btn login-btn">
                                    登录
                                </Link>
                                <Link to="/home/register" className="auth-btn register-btn">
                                    注册
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <p>&copy; 2024 盲盒抽奖机. 让每一次抽取都充满惊喜！</p>
            </footer>
        </div>
    );
};

export default Home;

