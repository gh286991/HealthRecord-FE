
// Based on the backend DTOs

export interface DietRecord {
  _id: string;
  mealType: string;
  totalCalories: number;
  // Add other fields as needed
}

export interface WorkoutRecord {
  _id: string;
  type: string;
  duration?: number;
  notes?: string;
  // Add other fields as needed
}

export interface WorkoutPlan {
  _id: string;
  name: string;
  status: string;
  // Add other fields as needed
}

export interface DietSummary {
  records: DietRecord[];
  dailyTotals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbohydrates: number;
    totalFat: number;
  };
}

export interface DashboardData {
  tdee: number;
  bmr: number;
  activityLevel: string;
  activityMultiplier: number;
  dietSummary: DietSummary;
  workoutRecords: WorkoutRecord[];
  workoutPlans: WorkoutPlan[];
}
