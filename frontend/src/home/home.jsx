import React ,{useState}from "react";
import { Outlet, useNavigate ,Link} from "react-router-dom";
import './home.css';

const Home = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState({});

    return (
        <div className="home-container">

            <header className="home-header">
                <div className="header-content">
                    <h1>Home</h1>
                    <div className="user-section">
                        {isLogin ? (
                            <div className="user-info">
                                <img src={user?.avatar || '/default-avatar.png'} alt="用户头像" className="avatar" />
                                <span>{user?.username}</span>
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
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li><Link to="/home">Ground</Link></li>
                            <li><Link to="/home/orders">Orders</Link></li>
                            <li>
                                <div className="search-box">
                                    <input type="text" placeholder="Search..." />
                                    <button >Search</button>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="content">
                    <Outlet />
                </main>

            </div>

        </div>
    )
};

export default Home;

