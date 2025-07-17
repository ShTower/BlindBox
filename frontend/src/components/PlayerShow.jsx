import React, { useState, useEffect, useRef } from 'react';
import { playerShowAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './PlayerShow.css';

const PlayerShow = () => {
    const { user } = useAuth();
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', image: null });
    const [uploading, setUploading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [showLikes, setShowLikes] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const fileInputRef = useRef();

    useEffect(() => {
        fetchShows();
    }, []);

    const fetchShows = async () => {
        try {
            setLoading(true);
            setError(''); // 清除之前的错误
            const res = await playerShowAPI.getAll({ limit: 20 });
            // 修正：正确解析axios返回结构
            if (res.data && res.data.success && res.data.data && res.data.data.shows) {
                setShows(res.data.data.shows);
                
                // 获取用户的点赞状态
                if (user) {
                    const likesStatus = {};
                    res.data.data.shows.forEach(show => {
                        likesStatus[show.id] = show.user_liked || false;
                    });
                    setShowLikes(likesStatus);
                }
            } else {
                setShows([]);
            }
        } catch (err) {
            console.error('获取玩家秀失败:', err);
            setError('获取玩家秀数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setForm((prev) => ({ ...prev, image: files[0] }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageError = (showId, imageUrl) => {
        console.error('图片加载失败:', imageUrl);
        setImageErrors(prev => ({ ...prev, [showId]: true }));
    };

    const handleImageLoad = (imageUrl) => {
        console.log('图片加载成功:', imageUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setSubmitMsg('请先登录后再发表玩家秀');
            return;
        }
        setUploading(true);
        let imageUrl = '';
        try {
            if (form.image) {
                const formData = new FormData();
                formData.append('image', form.image);
                const uploadRes = await playerShowAPI.uploadImage(formData);
                console.log('图片上传响应:', uploadRes.data);
                if (uploadRes.data && uploadRes.data.success) {
                    imageUrl = uploadRes.data.data.imageUrl;
                } else {
                    throw new Error('图片上传失败');
                }
            }
            await playerShowAPI.create({
                user_id: user.id,
                title: form.title,
                content: form.content,
                image_url: imageUrl,
            });
            setSubmitMsg('发表成功！');
            setForm({ title: '', content: '', image: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setShowForm(false); // 发表成功后关闭表单
            fetchShows();
        } catch (err) {
            setSubmitMsg('发表失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (showId) => {
        if (!user) {
            alert('请先登录后再点赞');
            return;
        }
        const isLiked = showLikes[showId];
        // 本地更新点赞状态和数量
        setShowLikes(prev => ({ ...prev, [showId]: !isLiked }));
        setShows(prevShows => prevShows.map(show =>
            show.id === showId
                ? { ...show, likes_count: show.likes_count + (isLiked ? -1 : 1) }
                : show
        ));
        try {
            let res;
            if (isLiked) {
                res = await playerShowAPI.unlike(showId);
            } else {
                res = await playerShowAPI.like(showId);
            }
            if (!(res.data && res.data.success)) {
                // 回滚本地状态
                setShowLikes(prev => ({ ...prev, [showId]: isLiked }));
                setShows(prevShows => prevShows.map(show =>
                    show.id === showId
                        ? { ...show, likes_count: show.likes_count + (isLiked ? 1 : -1) }
                        : show
                ));
                alert('操作失败，请重试');
            }
        } catch (err) {
            setShowLikes(prev => ({ ...prev, [showId]: isLiked }));
            setShows(prevShows => prevShows.map(show =>
                show.id === showId
                    ? { ...show, likes_count: show.likes_count + (isLiked ? 1 : -1) }
                    : show
            ));
            if (err.response?.status === 409) {
                fetchShows();
            } else if (err.response?.status === 401) {
                alert('请重新登录');
            } else {
                alert('操作失败，请重试');
            }
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        
        // 如果是相对路径（以 /uploads 开头），添加后端服务器地址
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:3000${imageUrl}`;
        }
        
        // 如果是完整URL，直接返回
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // 其他情况，假设是相对路径
        return `http://localhost:3000/uploads/${imageUrl}`;
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
                <div className="error">
                    <h3>⚠️ {error}</h3>
                    <button onClick={fetchShows} className="retry-button">
                        重新加载
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="player-show-container">
            <h2 className="player-show-title">🎉 玩家秀</h2>
            
            {/* 主要内容区域 - 显示所有玩家秀 */}
            <div className="show-content">
                {shows.length === 0 ? (
                    <div className="no-show">
                        <div className="no-show-content">
                            <h3>🎮 暂无玩家秀</h3>
                            <p>成为第一个分享抽奖心得的玩家吧！</p>
                        </div>
                    </div>
                ) : (
                    <div className="show-grid">
                        {shows.map((show) => (
                            <div key={show.id} className="show-card">
                                <div className="show-header">
                                    <span className="player-info">🎮 {show.username || '玩家'} </span>
                                    <span className="show-time">{new Date(show.created_at).toLocaleString('zh-CN')}</span>
                                </div>
                                <div className="show-product">
                                    {show.image_url && !imageErrors[show.id] && (
                                        <div className="product-image">
                                            <img 
                                                src={getImageUrl(show.image_url)} 
                                                alt="玩家秀" 
                                                onError={() => handleImageError(show.id, show.image_url)}
                                                onLoad={() => handleImageLoad(show.image_url)}
                                            />
                                        </div>
                                    )}
                                    {show.image_url && imageErrors[show.id] && (
                                        <div className="product-image error">
                                            <span>图片加载失败</span>
                                        </div>
                                    )}
                                    <div className="product-info">
                                        <h3 className="product-name">{show.title}</h3>
                                        <p className="product-description">{show.content}</p>
                                    </div>
                                </div>
                                <div className="show-footer">
                                    <button onClick={() => handleLike(show.id)}>
                                        {showLikes[show.id] ? '❤️' : '🤍'} 点赞({show.likes_count || 0})
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 底部发表按钮和表单 */}
            <div className="bottom-actions">
                {user ? (
                    <div className="publish-section">
                        <button 
                            className="publish-button" 
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? '收起' : '📝 发表玩家秀'}
                        </button>
                        
                        {showForm && (
                            <form className="player-show-form" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="标题"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    required
                                />
                                <textarea
                                    name="content"
                                    placeholder="分享你的抽奖心得..."
                                    value={form.content}
                                    onChange={handleFormChange}
                                    required
                                />
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFormChange}
                                />
                                <div className="form-actions">
                                    <button type="submit" disabled={uploading}>
                                        {uploading ? '发表中...' : '发表'}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)}>
                                        取消
                                    </button>
                                </div>
                                {submitMsg && <div className="submit-msg">{submitMsg}</div>}
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="login-prompt">
                        <span>🔐 登录后可发表玩家秀</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerShow;
