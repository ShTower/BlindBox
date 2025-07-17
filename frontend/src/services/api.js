import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 可以在这里添加认证token
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // 未授权，重定向到登录页
            window.location.href = '/home/login';
        }
        return Promise.reject(error);
    }
);

// 认证相关API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// 产品相关API
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (productData) => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
    search: (keyword) => api.get(`/products/search/${keyword}`),
};

// 订单相关API
export const orderAPI = {
    getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
    createOrder: (orderData) => api.post('/orders', orderData),
    getOrderById: (id) => api.get(`/orders/${id}`),
    getAllOrders: () => api.get('/orders'),
};

// 玩家秀相关API
export const playerShowAPI = {
    getAll: (params) => api.get('/player-shows', { params }),
    getById: (id) => api.get(`/player-shows/${id}`),
    create: (data) => api.post('/player-shows', data),
    uploadImage: (formData) => api.post('/player-shows/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    addComment: (showId, data) => api.post(`/player-shows/${showId}/comment`, data),
    getComments: (showId) => api.get(`/player-shows/${showId}/comments`),
    like: (showId, data) => api.post(`/player-shows/${showId}/like`, data),
    unlike: (showId, data) => api.post(`/player-shows/${showId}/unlike`, data),
};

// 健康检查
export const healthCheck = () => api.get('/health');

export default api; 