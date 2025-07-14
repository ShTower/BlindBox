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
            {/* 顶部导航栏 */}
            <header className="header">
                <div className="header-content">
                    <h1>🎁 盲盒抽奖机</h1>
                    <div className="user-section">
                        {user ? (
                            <div className="user-info">
                                <img src={user?.avatar || '/default-avatar.png'} alt="用户头像" className="avatar" />
                                <span>{user?.username}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    登出
                                </button>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <Link to="/home/login" className="login-link">登录</Link>
                                <span> / </span>
                                <Link to="/home/register" className="register-link">注册</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="main-content">
                {/* 左侧边栏 */}
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li><Link to="/home">首页</Link></li>
                            <li><Link to="/home/products">盲盒列表</Link></li>
                            <li><Link to="/home/orders">我的订单</Link></li>
                            <li><Link to="/home/show">玩家秀</Link></li>
                            <li>
                                <div className="search-box">
                                    <input type="text" placeholder="搜索商品..." />
                                    <button>搜索</button>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* 主内容区 */}
                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Home;

