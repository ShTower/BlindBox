import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getById(id);
            setProduct(response.data.product);
        } catch (error) {
            setError('获取盲盒详情失败');
            console.error('获取产品详情错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDraw = async () => {
        if (!user) {
            alert('请先登录');
            navigate('/home/login');
            return;
        }

        if (quantity > product.stock) {
            alert('库存不足');
            return;
        }

        setDrawing(true);
        try {
            console.log('发送抽取请求:', {
                product_id: product.id,
                quantity: quantity
            });
            
            const response = await orderAPI.createOrder({
                product_id: product.id,
                quantity: quantity
            });

            console.log('抽取成功:', response.data);
            alert('盲盒抽取成功！');
            // 刷新产品信息以更新库存
            fetchProduct();
        } catch (error) {
            console.error('抽取失败:', error);
            console.error('错误详情:', error.response?.data);
            alert(error.response?.data?.error || error.response?.data?.details || '抽取失败');
        } finally {
            setDrawing(false);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-container">
                <div className="error">{error || '盲盒不存在'}</div>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-card">
                <div className="product-image-section">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="product-image" />
                    ) : (
                        <div className="placeholder-image large">
                            <span>盲盒</span>
                        </div>
                    )}
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-stats">
                        <div className="stat-item">
                            <span className="stat-label">价格:</span>
                            <span className="stat-value price">¥{product.price}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">库存:</span>
                            <span className="stat-value stock">{product.stock}</span>
                        </div>
                    </div>

                    {product.stock > 0 ? (
                        <div className="draw-section">
                            <div className="quantity-selector">
                                <label htmlFor="quantity">抽取数量:</label>
                                <select
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    disabled={drawing}
                                >
                                    {[...Array(Math.min(5, product.stock))].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="total-price">
                                总价: ¥{product.price * quantity}
                            </div>

                            <button
                                className="draw-button"
                                onClick={handleDraw}
                                disabled={drawing || !user}
                            >
                                {drawing ? '抽取中...' : '立即抽取'}
                            </button>

                            {!user && (
                                <p className="login-prompt">
                                    请先登录后再抽取盲盒
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="out-of-stock">
                            <p>该盲盒已售罄</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="back-button-section">
                <button
                    className="back-button"
                    onClick={() => navigate('/home')}
                >
                    返回列表
                </button>
            </div>
        </div>
    );
};

export default ProductDetail; 