import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', 
});

axiosInstance.interceptors.request.use(config => {
    const publicPaths = ['/auth/password_reset/', '/auth/password_reset/confirm/'];

    if (!publicPaths.some(path => config.url.startsWith(path))) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
    }

    config.headers['Content-Type'] = 'application/json';
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
