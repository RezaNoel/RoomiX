// src/services/api.ts
import axios from 'axios';

// ایجاد یک نمونه از axios برای استفاده از توکن در درخواست‌ها
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// اضافه کردن توکن JWT به هر درخواست از طریق interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // دریافت توکن از localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// متد ورود کاربر و دریافت توکن‌ها و پروفایل کاربر
export const loginUser = async (username: string, password: string) => {
  try {
    // درخواست برای دریافت توکن JWT
    const response = await api.post('/token/', {
      username,
      password,
    });

    if (response.data.access) {
      const token = response.data.access;
      const refreshToken = response.data.refresh;

      // ذخیره توکن‌ها در localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // دریافت اطلاعات پروفایل کاربر
      const profileResponse = await api.get('/user_management/user-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.status === 200) {
        // ذخیره اطلاعات پروفایل در کوکی
        document.cookie = `profile_info=${JSON.stringify(profileResponse.data)}; path=/`;
      } else {
        throw new Error('Failed to fetch user profile');
      }

      return {
        token,
        refreshToken,
      };
    }
    throw new Error('Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export default api;
