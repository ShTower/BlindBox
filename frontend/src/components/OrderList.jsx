import React, { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './OrderList.css';

const OrderList = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getUserOrders(user.id);
            const ordersWithProducts = await Promise.all(
                response.data.orders.map(async (order) => {
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
            setOrders(ordersWithProducts);
        } catch (error) {
            setError('获取订单列表失败');
            console.error('获取订单列表错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    if (!user) {
        return (
            <div className="order-list-container">
                <div className="auth-required">
                    <p>请先登录查看订单</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="order-list-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-list-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="order-list-container">
            <h2 className="order-list-title">我的抽取记录</h2>
            
            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>暂无抽取记录</p>
                    <p>快去抽取你的第一个盲盒吧！</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-id">订单 #{order.id}</span>
                                <span className="order-date">
                                    {formatDate(order.order_date)}
                                </span>
                            </div>
                            
                            <div className="order-product">
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
                                </div>
                            </div>
                            
                            <div className="order-details">
                                <div className="detail-item">
                                    <span className="detail-label">数量:</span>
                                    <span className="detail-value">{order.quantity}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">单价:</span>
                                    <span className="detail-value">¥{order.product.price}</span>
                                </div>
                                <div className="detail-item total">
                                    <span className="detail-label">总价:</span>
                                    <span className="detail-value">¥{order.total_price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList; 