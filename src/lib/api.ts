import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

// 建立 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 自動添加 JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器 - 處理 401 錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // 只有在非登入頁面時才跳轉，避免登入失敗時頁面刷新
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 類型定義
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
}

// API 函數
export const authApi = {
  // 註冊
  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // 登入
  login: async (data: LoginData): Promise<{ accessToken: string; user?: UserProfile }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // 獲取用戶資料
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // 更新用戶資料
  updateProfile: async (data: UpdateUserData): Promise<UserProfile> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
};

// 工具函數
export const tokenUtils = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
}; 