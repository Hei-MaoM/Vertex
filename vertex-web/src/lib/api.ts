import axios from 'axios';

// 从 localStorage 读取 Token
const getToken = () => localStorage.getItem('jwt_token');

// 1. 用户服务 API (8081)
export const userApi = axios.create({
    baseURL: 'http://localhost:8081',
    timeout: 5000,
});

// 2. 题目服务 API (8082)
export const problemApi = axios.create({
    baseURL: 'http://localhost:8082',
    timeout: 5000,
});

// 请求拦截器：自动带上 Token
const authInterceptor = (config: any) => {
    const token = getToken();
    if (token) {
        // ⚠️ 关键：这里加上了 "Bearer " 前缀
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

userApi.interceptors.request.use(authInterceptor);
problemApi.interceptors.request.use(authInterceptor);

// 响应拦截器：处理 401 未登录
const errorInterceptor = (error: any) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwt_token');
        // 如果是 401，刷新页面让用户重新登录
        window.location.reload();
    }
    return Promise.reject(error);
};

userApi.interceptors.response.use((res) => res, errorInterceptor);
problemApi.interceptors.response.use((res) => res, errorInterceptor);
