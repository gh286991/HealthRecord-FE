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
  food?: Food;
}

export interface Food {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  category: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 表單用的食物項目（簡化版）
export interface FormFoodItem {
  foodId: string;
  quantity: number;
}

export interface CreateNutritionRecord {
  date: string;
  mealType: '早餐' | '午餐' | '晚餐' | '點心';
  foods: FormFoodItem[];
  notes?: string;
  photoUrl?: string;
}

export interface UpdateNutritionRecord {
  date?: string;
  mealType?: '早餐' | '午餐' | '晚餐' | '點心';
  foods?: FormFoodItem[];
  notes?: string;
  photoUrl?: string;
}

export interface NutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  recordCount: number;
  records: NutritionRecord[];
}

// API回應格式
export interface DailyNutritionResponse {
  date: string;
  records: NutritionRecord[];
  dailyTotals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbohydrates: number;
    totalFat: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
    mealCount: number;
  };
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

// 健身紀錄相關類型
export interface WorkoutSet {
  weight: number;
  reps: number;
  restSeconds?: number;
  rpe?: number;
}

export interface WorkoutExercise {
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutRecord {
  _id: string;
  userId: string;
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutRecord {
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface UpdateWorkoutRecord {
  date?: string;
  exercises?: WorkoutExercise[];
  notes?: string;
}

export interface DailyWorkoutResponse {
  date: string;
  records: WorkoutRecord[];
  dailyTotals: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    recordCount: number;
  };
}

// 健身紀錄 API
export const workoutApi = {
  create: async (data: CreateWorkoutRecord): Promise<WorkoutRecord> => {
    const response = await api.post('/workout-records', data);
    return response.data;
  },
  getList: async (params?: { date?: string }): Promise<DailyWorkoutResponse> => {
    const response = await api.get('/workout-records', { params });
    const records: WorkoutRecord[] = response.data;
    if (Array.isArray(records)) {
      const dailyTotals = records.reduce((t, r) => ({
        totalVolume: t.totalVolume + r.totalVolume,
        totalSets: t.totalSets + r.totalSets,
        totalReps: t.totalReps + r.totalReps,
        recordCount: t.recordCount + 1,
      }), { totalVolume: 0, totalSets: 0, totalReps: 0, recordCount: 0 });
      return { date: params?.date || new Date().toISOString().split('T')[0], records, dailyTotals };
    }
    return response.data;
  },
  getDailySummary: async (date: string): Promise<DailyWorkoutResponse> => {
    const response = await api.get('/workout-records/daily-summary', { params: { date } });
    return response.data;
  },
  getById: async (id: string): Promise<WorkoutRecord> => {
    const response = await api.get(`/workout-records/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateWorkoutRecord): Promise<WorkoutRecord> => {
    const response = await api.patch(`/workout-records/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/workout-records/${id}`);
    return response.data;
  },
};

// 飲食紀錄 API
export const nutritionApi = {
  // 創建飲食紀錄
  create: async (data: CreateNutritionRecord): Promise<NutritionRecord> => {
    const response = await api.post('/diet-records', data);
    return response.data;
  },

  // 創建飲食紀錄（包含圖片）
  createWithPhoto: async (data: CreateNutritionRecord, photoFile?: File): Promise<NutritionRecord> => {
    const formData = new FormData();
    
    // 添加基本數據
    formData.append('date', data.date);
    formData.append('mealType', data.mealType);
    
    // 添加食物數據（需要轉換為 JSON 字符串）
    formData.append('foods', JSON.stringify(data.foods));
    
    // 添加備註
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // 添加圖片
    if (photoFile) {
      formData.append('file', photoFile);
    }
    
    const response = await api.post('/diet-records/with-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 獲取用戶的飲食紀錄列表
  getList: async (params?: {
    date?: string;
  }): Promise<DailyNutritionResponse> => {
    try {
      const response = await api.get('/diet-records', { params });
      const records: NutritionRecord[] = response.data;
      
      // 如果 API 直接回傳陣列，需要轉換為 DailyNutritionResponse 格式
      if (Array.isArray(records)) {
        // 計算每日總計
        const dailyTotals = records.reduce((totals, record) => ({
          totalCalories: totals.totalCalories + record.totalCalories,
          totalProtein: totals.totalProtein + record.totalProtein,
          totalCarbohydrates: totals.totalCarbohydrates + record.totalCarbohydrates,
          totalFat: totals.totalFat + record.totalFat,
          totalFiber: totals.totalFiber + record.totalFiber,
          totalSugar: totals.totalSugar + record.totalSugar,
          totalSodium: totals.totalSodium + record.totalSodium,
          mealCount: totals.mealCount + 1,
        }), {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0,
          mealCount: 0,
        });

        return {
          date: params?.date || new Date().toISOString().split('T')[0],
          records,
          dailyTotals,
        };
      }
      
      // 如果已經是正確格式，直接回傳
      return response.data;
    } catch (error) {
      console.error('無法獲取飲食紀錄，嘗試使用本地資料:', error);
      
      // 嘗試從本地存儲獲取資料
      const localRecords = localStorage.getItem('nutrition-records');
      if (localRecords) {
        const allRecords: NutritionRecord[] = JSON.parse(localRecords);
        const targetDate = params?.date || new Date().toISOString().split('T')[0];
        const records = allRecords.filter(record => 
          record.date.split('T')[0] === targetDate
        );
        
        const dailyTotals = records.reduce((totals, record) => ({
          totalCalories: totals.totalCalories + record.totalCalories,
          totalProtein: totals.totalProtein + record.totalProtein,
          totalCarbohydrates: totals.totalCarbohydrates + record.totalCarbohydrates,
          totalFat: totals.totalFat + record.totalFat,
          totalFiber: totals.totalFiber + record.totalFiber,
          totalSugar: totals.totalSugar + record.totalSugar,
          totalSodium: totals.totalSodium + record.totalSodium,
          mealCount: totals.mealCount + 1,
        }), {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0,
          mealCount: 0,
        });

        return {
          date: targetDate,
          records,
          dailyTotals,
        };
      }
      
      // 如果沒有本地資料，回傳空結果
      return {
        date: params?.date || new Date().toISOString().split('T')[0],
        records: [],
        dailyTotals: {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0,
          mealCount: 0,
        },
      };
    }
  },

  // 根據日期獲取飲食摘要
  getDailySummary: async (date: string): Promise<NutritionSummary> => {
    const response = await api.get('/diet-records/daily-summary', { 
      params: { date } 
    });
    return response.data;
  },

  // 獲取單個飲食紀錄
  getById: async (id: string): Promise<NutritionRecord> => {
    const response = await api.get(`/diet-records/${id}`);
    return response.data;
  },

  // 更新飲食紀錄
  update: async (id: string, data: UpdateNutritionRecord): Promise<NutritionRecord> => {
    const response = await api.patch(`/diet-records/${id}`, data);
    return response.data;
  },

  // 刪除飲食紀錄
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/diet-records/${id}`);
    return response.data;
  },

  // 上傳圖片到飲食紀錄
  uploadPhoto: async (id: string, file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/diet-records/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 獲取週統計
  getWeeklyStats: async (startDate: string): Promise<{
    totalCalories: number;
    avgCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    dailyStats: Array<{
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }> => {
    const response = await api.get(`/nutrition/stats/weekly/${startDate}`);
    return response.data;
  },

  // 獲取月統計
  getMonthlyStats: async (year: number, month: number): Promise<{
    totalCalories: number;
    avgCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    dailyStats: Array<{
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }> => {
    const response = await api.get(`/nutrition/stats/monthly/${year}/${month}`);
    return response.data;
  },

  // 獲取有飲食記錄的日期標記
  getMarkedDates: async (year: number, month: number): Promise<string[]> => {
    try {
      const response = await api.get(`/diet-records/marked-dates/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.warn('無法獲取標記日期，使用本地資料:', error);
      
      // 從本地存儲獲取標記日期
      const localRecords = localStorage.getItem('nutrition-records');
      if (localRecords) {
        const allRecords: NutritionRecord[] = JSON.parse(localRecords);
        const targetMonthRecords = allRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
        });
        
        // 提取唯一日期
        const uniqueDates = new Set<string>();
        targetMonthRecords.forEach(record => {
          const dateStr = record.date.split('T')[0];
          uniqueDates.add(dateStr);
        });
        
        return Array.from(uniqueDates).sort();
      }
      
      return [];
    }
  },
};

// 食物 API
export const foodApi = {
  // 獲取所有食物
  getAll: async (params?: {
    category?: string;
    isActive?: boolean;
  }): Promise<Food[]> => {
    const response = await api.get('/foods', { params });
    return response.data;
  },

  // 獲取食物分類
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/foods/categories');
    return response.data;
  },

  // 根據 ID 獲取食物
  getById: async (id: string): Promise<Food> => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },

  // 創建食物
  create: async (data: Omit<Food, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Food> => {
    const response = await api.post('/foods', data);
    return response.data;
  },

  // 更新食物
  update: async (id: string, data: Partial<Omit<Food, '_id' | 'createdAt' | 'updatedAt' | '__v'>>): Promise<Food> => {
    const response = await api.patch(`/foods/${id}`, data);
    return response.data;
  },

  // 刪除食物
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/foods/${id}`);
    return response.data;
  },

  // 上傳食物照片
  uploadPhoto: async (id: string, file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/foods/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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