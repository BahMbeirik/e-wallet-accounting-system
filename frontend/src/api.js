import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://bahah.pythonanywhere.com/api', 
});

axiosInstance.interceptors.request.use(config => {
    const publicPaths = ['/auth/password_reset/', '/auth/password_reset/confirm/'];

    if (!publicPaths.some(path => config.url.startsWith(path))) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
    }

    // إذا كان data عبارة عن FormData لا تغيّر Content-Type
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
