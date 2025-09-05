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
export interface FoodItem {
  foodId?: string;
  foodName: string;
  description?: string;
  quantity?: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

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
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
}

// 活動量枚舉
export enum ActivityLevel {
  SEDENTARY = 'sedentary', // 久坐：很少或沒有運動
  LIGHTLY_ACTIVE = 'lightly_active', // 輕度活躍：每週輕度運動/體育活動 1-3 天
  MODERATELY_ACTIVE = 'moderately_active', // 中度活躍：每週中度運動/體育活動 3-5 天
  VERY_ACTIVE = 'very_active', // 非常活躍：每週高強度運動/體育活動 6-7 天
  EXTRA_ACTIVE = 'extra_active', // 極度活躍：非常高強度運動/體育活動 & 從事體力勞動或每天訓練兩次
}

export enum Goal {
  WEIGHT_LOSS = 'weight_loss', // 減重
  MAINTAIN = 'maintain', // 維持
  MUSCLE_GAIN = 'muscle_gain', // 增肌
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










// Dashboard API
export const getDashboardData = async (token: string) => {
  const response = await api.get('/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
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