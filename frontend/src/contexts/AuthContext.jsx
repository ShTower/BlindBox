import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 检查用户是否已登录
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
        } catch (error) {
            setUser(null);
            if (error.isAuthError) {
                navigate('/home/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            if (error.isAuthError) {
                navigate('/home/login');
            }
            return { 
                success: false, 
                error: error.response?.data?.error || '登录失败' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            if (error.isAuthError) {
                navigate('/home/login');
            }
            return { 
                success: false, 
                error: error.response?.data?.error || '注册失败' 
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            navigate('/home/login');
            return { success: true };
        } catch (error) {
            if (error.isAuthError) {
                navigate('/home/login');
            }
            return { 
                success: false, 
                error: error.response?.data?.error || '登出失败' 
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 