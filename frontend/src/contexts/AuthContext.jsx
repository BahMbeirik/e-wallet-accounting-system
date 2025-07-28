import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/me/'); 
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token'); // إزالة التوكن إذا كان غير صالح
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحديث بيانات المستخدم يدوياً
  const refreshUser = () => {
    setLoading(true);
    fetchCurrentUser();
  };

  // دالة لتسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // مراقبة تغييرات localStorage للتوكن
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // تم إضافة توكن جديد
          refreshUser();
        } else {
          // تم حذف التوكن
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);