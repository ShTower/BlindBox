import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(''); // 清除之前的错误
            const params = {
                page: currentPage,
                limit: 12,
                search: searchTerm
            };
            const response = await productAPI.getAll(params);
            
            // 确保数据结构正确并去重
            const productsData = response.data.products || [];
            const uniqueProducts = productsData.filter((product, index, self) => 
                index === self.findIndex(p => p.id === product.id)
            );
            
            setProducts(uniqueProducts);
            setPagination(response.data.pagination || {});
        } catch (error) {
            setError('获取盲盒列表失败');
            console.error('获取产品列表错误:', error);
            setProducts([]); // 错误时清空产品列表
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        // 不需要手动调用 fetchProducts，因为 useEffect 会监听 currentPage 的变化
    };

    const handleProductClick = (productId) => {
        navigate(`/home/product/${productId}`);
    };

    if (loading) {
        return (
            <div className="product-list-container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="搜索盲盒..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        搜索
                    </button>
                </form>
            </div>

            <div className="products-grid">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="product-card"
                        onClick={() => handleProductClick(product.id)}
                    >
                        <div className="product-image">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} />
                            ) : (
                                <div className="placeholder-image">
                                    <span>盲盒</span>
                                </div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <div className="product-price">
                                ¥{product.price}
                            </div>
                            <div className="product-stock">
                                库存: {product.stock}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="no-products">
                    <p>暂无盲盒</p>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        上一页
                    </button>
                    <span className="page-info">
                        第 {currentPage} 页，共 {pagination.totalPages} 页
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="pagination-button"
                    >
                        下一页
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductList;