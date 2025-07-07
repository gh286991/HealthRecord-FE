// ========== 認證相關類型 ==========
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

export interface AuthResponse {
  accessToken: string;
  user?: UserProfile;
}

// ========== 食物相關類型 ==========
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

export interface FoodItem {
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  food?: Food;
}

export interface FormFoodItem {
  foodId: string;
  quantity: number;
}

// ========== 營養記錄相關類型 ==========
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

// ========== UI 狀態類型 ==========
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
}

// ========== API 查詢參數類型 ==========
export interface NutritionQueryParams {
  date?: string;
}

export interface FoodQueryParams {
  category?: string;
  isActive?: boolean;
}

export interface WeeklyStatsResponse {
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
}

export type MonthlyStatsResponse = WeeklyStatsResponse;

// ========== 通用 API 回應類型 ==========
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 