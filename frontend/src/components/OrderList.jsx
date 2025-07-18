import React, { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './OrderList.css';

const OrderList = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showResultsModal, setShowResultsModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(''); // 清除之前的错误
            
            const response = await orderAPI.getUserOrders(user.id);
            console.log('API响应:', response.data); // 调试日志
            
            // 修复：直接使用response.data，因为后端返回的就是订单数组
            const ordersData = response.data || [];
            
            const ordersWithProducts = await Promise.all(
                ordersData.map(async (order) => {
                    try {
                        const productResponse = await productAPI.getById(order.product_id);
                        
                        // 获取抽取结果
                        let drawResults = [];
                        try {
                            const resultsResponse = await orderAPI.getOrderResults(order.id);
                            drawResults = resultsResponse.data || [];
                        } catch (resultError) {
                            console.warn('获取抽取结果失败:', resultError);
                        }
                        
                        return {
                            ...order,
                            product: productResponse.data.product || productResponse.data,
                            drawResults: drawResults
                        };
                    } catch (error) {
                        console.error('获取产品信息失败:', error);
                        return {
                            ...order,
                            product: { 
                                name: '未知产品', 
                                price: 0,
                                description: '产品信息获取失败'
                            },
                            drawResults: []
                        };
                    }
                })
            );
            
            setOrders(ordersWithProducts);
        } catch (error) {
            console.error('获取订单列表错误:', error);
            
            // 提供更详细的错误信息
            if (error.response?.status === 404) {
                setError('订单API不存在，请检查后端服务');
            } else if (error.response?.status === 401) {
                setError('未授权，请重新登录');
            } else if (error.response?.status === 403) {
                setError('权限不足');
            } else {
                setError('获取订单列表失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowResultsModal(true);
    };

    const closeModal = () => {
        setShowResultsModal(false);
        setSelectedOrder(null);
    };

    const getRarityColor = (rarity) => {
        const colors = {
            'common': '#95a5a6',
            'uncommon': '#27ae60',
            'rare': '#3498db',
            'epic': '#9b59b6',
            'legendary': '#f39c12',
            'mythic': '#e74c3c'
        };
        return colors[rarity] || colors['common'];
    };

    const getRarityName = (rarity) => {
        const names = {
            'common': '普通',
            'uncommon': '稀有',
            'rare': '精品',
            'epic': '史诗',
            'legendary': '传说',
            'mythic': '神话'
        };
        return names[rarity] || '普通';
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
                <div className="error">
                    {error}
                    <button onClick={fetchOrders} style={{ marginLeft: '10px' }}>
                        重试
                    </button>
                </div>
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
                        <div 
                            key={order.id} 
                            className="order-card clickable"
                            onClick={() => handleOrderClick(order)}
                        >
                            <div className="order-header">
                                <span className="order-id">订单 #{order.id}</span>
                                <span className="order-date">
                                    {formatDate(order.order_date)}
                                </span>
                            </div>
                            
                            <div className="order-product">
                                <div className="product-image">
                                    {order.product?.image_url ? (
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
                                        {order.product?.name || '未知产品'}
                                    </h3>
                                    <p className="product-description">
                                        {order.product?.description || '暂无描述'}
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
                                    <span className="detail-value">¥{order.product?.price || 0}</span>
                                </div>
                                <div className="detail-item total">
                                    <span className="detail-label">总价:</span>
                                    <span className="detail-value">¥{order.total_price}</span>
                                </div>
                            </div>

                            {/* 抽取结果提示 */}
                            <div className="results-hint">
                                {order.drawResults && order.drawResults.length > 0 ? (
                                    <span className="has-results">
                                        🎁 已抽取 {order.drawResults.length} 件物品 - 点击查看
                                    </span>
                                ) : (
                                    <span className="no-results-hint">
                                        📦 暂无抽取结果
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 抽取结果弹窗 */}
            {showResultsModal && selectedOrder && (
                <div className="results-modal-overlay" onClick={closeModal}>
                    <div className="results-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🎉 抽取结果</h2>
                            <div className="order-info">
                                <span>订单 #{selectedOrder.id}</span>
                                <span>{formatDate(selectedOrder.order_date)}</span>
                            </div>
                            <button className="close-button" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="product-summary">
                                <div className="product-image-small">
                                    {selectedOrder.product?.image_url ? (
                                        <img 
                                            src={selectedOrder.product.image_url} 
                                            alt={selectedOrder.product.name}
                                        />
                                    ) : (
                                        <div className="placeholder-image small">
                                            <span>盲盒</span>
                                        </div>
                                    )}
                                </div>
                                <div className="product-details">
                                    <h3>{selectedOrder.product?.name || '未知产品'}</h3>
                                    <p>数量: {selectedOrder.quantity} | 总价: ¥{selectedOrder.total_price}</p>
                                </div>
                            </div>

                            {selectedOrder.drawResults && selectedOrder.drawResults.length > 0 ? (
                                <div className="results-grid">
                                    {selectedOrder.drawResults.map((result, index) => (
                                        <div key={index} className="result-card">
                                            <div className="result-image-large">
                                                {result.item_image_url ? (
                                                    <img 
                                                        src={result.item_image_url} 
                                                        alt={result.item_name}
                                                    />
                                                ) : (
                                                    <div className="placeholder-result-image-large">
                                                        <span>🎁</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="result-details">
                                                <h4 className="result-name">{result.item_name}</h4>
                                                <p className="result-description">{result.item_description}</p>
                                                <span 
                                                    className="result-rarity-badge"
                                                    style={{ 
                                                        backgroundColor: getRarityColor(result.item_rarity),
                                                        color: 'white'
                                                    }}
                                                >
                                                    {getRarityName(result.item_rarity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-results-modal">
                                    <div className="empty-state">
                                        <span className="empty-icon">📦</span>
                                        <h3>暂无抽取结果</h3>
                                        <p>该订单还没有抽取结果记录</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;