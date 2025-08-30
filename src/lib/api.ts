import axios from 'axios';

// 匯出統一的 API Base URL，所有 API 模組共用，避免不同檔案 fallback 不一致
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app';

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

// 飲食紀錄相關類型
export interface NutritionRecord {
  _id: string;
  userId: string;
  date: string;
  mealType: '早餐' | '午餐' | '晚餐' | '點心';
  foods: FoodItem[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}









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