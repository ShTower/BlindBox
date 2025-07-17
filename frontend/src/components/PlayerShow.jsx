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
    const [expandedShows, setExpandedShows] = useState(new Set());
    const [commentForms, setCommentForms] = useState({});
    const [showComments, setShowComments] = useState({});
    const [showLikes, setShowLikes] = useState({});
    const fileInputRef = useRef();

    useEffect(() => {
        fetchShows();
    }, []);

    const fetchShows = async () => {
        try {
            setLoading(true);
            setError(''); // 清除之前的错误
            const res = await playerShowAPI.getAll({ limit: 20 });
            
            // 检查响应结构
            if (res.success && res.data && res.data.shows) {
                setShows(res.data.shows);
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
                imageUrl = uploadRes.data.imageUrl;
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

    const toggleExpanded = (showId) => {
        setExpandedShows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(showId)) {
                newSet.delete(showId);
            } else {
                newSet.add(showId);
                if (!showComments[showId]) fetchComments(showId);
            }
            return newSet;
        });
    };

    const fetchComments = async (showId) => {
        try {
            const res = await playerShowAPI.getComments(showId);
            if (res.success && res.data && res.data.comments) {
                setShowComments(prev => ({ ...prev, [showId]: res.data.comments }));
            }
        } catch (err) {
            console.error('获取评论失败:', err);
        }
    };

    const handleCommentSubmit = async (showId) => {
        if (!user) {
            alert('请先登录后再评论');
            return;
        }
        const content = commentForms[showId];
        if (!content?.trim()) return;
        
        try {
            const res = await playerShowAPI.addComment(showId, { content });
            if (res.success) {
                setCommentForms(prev => ({ ...prev, [showId]: '' }));
                fetchComments(showId);
                fetchShows(); // 刷新评论数
            }
        } catch (err) {
            console.error('评论失败:', err);
            alert('评论失败，请重试');
        }
    };

    const handleLike = async (showId) => {
        if (!user) {
            alert('请先登录后再点赞');
            return;
        }
        
        try {
            const isLiked = showLikes[showId];
            if (isLiked) {
                await playerShowAPI.unlike(showId);
            } else {
                await playerShowAPI.like(showId);
            }
            setShowLikes(prev => ({ ...prev, [showId]: !isLiked }));
            fetchShows(); // 刷新点赞数
        } catch (err) {
            console.error('点赞操作失败:', err);
            alert('操作失败，请重试');
        }
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
                                    {show.image_url && (
                                        <div className="product-image">
                                            <img src={show.image_url.startsWith('/uploads') ? `http://localhost:3000${show.image_url}` : show.image_url} alt="玩家秀" />
                                        </div>
                                    )}
                                    <div className="product-info">
                                        <h3 className="product-name">{show.title}</h3>
                                        <p className="product-description">{show.content}</p>
                                    </div>
                                </div>
                                <div className="show-footer">
                                    <button onClick={() => toggleExpanded(show.id)}>
                                        评论 ({show.comments_count || 0})
                                    </button>
                                    <button onClick={() => handleLike(show.id)}>
                                        {showLikes[show.id] ? '❤️' : '🤍'} 点赞({show.likes_count || 0})
                                    </button>
                                </div>
                                {expandedShows.has(show.id) && (
                                    <div className="show-details">
                                        <div className="comments-section">
                                            <h4>评论</h4>
                                            {showComments[show.id] ? (
                                                <div className="comments-list">
                                                    {showComments[show.id].map(comment => (
                                                        <div key={comment.id} className="comment-item">
                                                            <span className="comment-author">{comment.username}</span>
                                                            <span className="comment-content">{comment.content}</span>
                                                            <span className="comment-time">{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <button onClick={() => fetchComments(show.id)}>加载评论</button>
                                            )}
                                            {user && (
                                                <div className="comment-form">
                                                    <input
                                                        type="text"
                                                        placeholder="发表评论..."
                                                        value={commentForms[show.id] || ''}
                                                        onChange={(e) => setCommentForms(prev => ({ ...prev, [show.id]: e.target.value }))}
                                                    />
                                                    <button onClick={() => handleCommentSubmit(show.id)}>发送</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
