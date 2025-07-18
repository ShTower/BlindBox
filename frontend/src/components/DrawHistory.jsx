import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './DrawHistory.css';

const DrawHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchDrawHistory();
        }
    }, [user]);

    const fetchDrawHistory = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getDrawHistory();
            setHistory(response.data);
        } catch (error) {
            setError('获取抽取历史失败');
            console.error('获取抽取历史错误:', error);
        } finally {
            setLoading(false);
        }
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        return (
            <div className="draw-history-container">
                <div className="not-logged-in">
                    <p>请先登录查看抽取历史</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="draw-history-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="draw-history-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="draw-history-container">
            <div className="history-header">
                <h1>我的抽取历史</h1>
                <p>查看您所有的盲盒抽取记录</p>
            </div>

            {history.length === 0 ? (
                <div className="no-history">
                    <div className="empty-state">
                        <span className="empty-icon">📦</span>
                        <h3>暂无抽取记录</h3>
                        <p>快去抽取您的第一个盲盒吧！</p>
                    </div>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <div key={item.id} className="history-item">
                            <div className="item-image-section">
                                {item.item_image_url ? (
                                    <img 
                                        src={item.item_image_url} 
                                        alt={item.item_name}
                                        className="item-image"
                                    />
                                ) : (
                                    <div className="placeholder-image">
                                        <span>🎁</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="item-details">
                                <div className="item-header">
                                    <h3 className="item-name">{item.item_name}</h3>
                                    <span 
                                        className="item-rarity"
                                        style={{ 
                                            color: getRarityColor(item.item_rarity),
                                            borderColor: getRarityColor(item.item_rarity)
                                        }}
                                    >
                                        {getRarityName(item.item_rarity)}
                                    </span>
                                </div>
                                
                                <p className="item-description">{item.item_description}</p>
                                
                                <div className="item-meta">
                                    <span className="product-info">
                                        来自: <strong>{item.product_name}</strong>
                                    </span>
                                    <span className="draw-date">
                                        抽取时间: {formatDate(item.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DrawHistory;
