import axios from 'axios';
import { refreshTokendata } from '../services/authService';

const api = axios.create({
    //baseURL: 'https://localhost:7260/api',
    baseURL: 'https://hoffstee.azurewebsites.net/api',
});

// 🔐 Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// 🔄 Response Interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // Optional: skip refresh if tokens are missing
        if (!accessToken || !refreshToken) {
          throw new Error('Missing tokens');
        }

        // Refresh token call
        // const res = await axios.post(`${api.defaults.baseURL}/Auth/refresh`, {
        //   accessToken,
        //   refreshToken
        // });
        
        const res = await refreshTokendata(accessToken, refreshToken);
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        // Store new tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔒 Token refresh failed:', refreshError.response?.data || refreshError.message);

        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;