import React, { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../services/api';
import './PlayerShow.css';

const PlayerShow = () => {
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRecentOrders();
    }, []);

    const fetchRecentOrders = async () => {
        try {
            setLoading(true);
            // 获取最近的订单（这里简化处理，实际应该从后端获取）
            const response = await orderAPI.getAllOrders();
            const recentOrders = response.data.orders.slice(0, 20); // 取最近20个订单
            
            const ordersWithProducts = await Promise.all(
                recentOrders.map(async (order) => {
                    try {
                        const productResponse = await productAPI.getById(order.product_id);
                        return {
                            ...order,
                            product: productResponse.data.product
                        };
                    } catch (error) {
                        return {
                            ...order,
                            product: { name: '未知产品', price: 0 }
                        };
                    }
                })
            );
            
            setRecentOrders(ordersWithProducts);
        } catch (error) {
            setError('获取玩家秀数据失败');
            console.error('获取玩家秀错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    if (loading) {
        return (
            <div className="player-show-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="player-show-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="player-show-container">
            <h2 className="player-show-title">🎉 玩家秀 - 最新抽取</h2>
            
            {recentOrders.length === 0 ? (
                <div className="no-show">
                    <p>暂无抽取记录</p>
                    <p>成为第一个抽取盲盒的玩家吧！</p>
                </div>
            ) : (
                <div className="show-grid">
                    {recentOrders.map((order) => (
                        <div key={order.id} className="show-card">
                            <div className="show-header">
                                <span className="player-info">
                                    🎮 玩家 #{order.user_id}
                                </span>
                                <span className="show-time">
                                    {formatDate(order.order_date)}
                                </span>
                            </div>
                            
                            <div className="show-product">
                                <div className="product-image">
                                    {order.product.image_url ? (
                                        <img 
                                            src={order.product.image_url} 
                                            alt={order.product.name} 
                                        />
                                    ) : (
                                        <div className="placeholder-image small">
                                            <span>盲盒</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="product-info">
                                    <h3 className="product-name">
                                        {order.product.name}
                                    </h3>
                                    <p className="product-description">
                                        {order.product.description}
                                    </p>
                                    <div className="draw-info">
                                        <span className="quantity">
                                            抽取了 {order.quantity} 个
                                        </span>
                                        <span className="price">
                                            ¥{order.total_price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="show-footer">
                                <span className="congratulation">
                                    🎊 恭喜获得！
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="show-stats">
                <div className="stat-card">
                    <h3>今日抽取</h3>
                    <p className="stat-number">
                        {recentOrders.filter(order => {
                            const today = new Date().toDateString();
                            const orderDate = new Date(order.order_date).toDateString();
                            return today === orderDate;
                        }).length}
                    </p>
                </div>
                <div className="stat-card">
                    <h3>总抽取数</h3>
                    <p className="stat-number">{recentOrders.length}</p>
                </div>
                <div className="stat-card">
                    <h3>参与玩家</h3>
                    <p className="stat-number">
                        {new Set(recentOrders.map(order => order.user_id)).size}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlayerShow; 