'use client';

import { useTranslations } from 'next-intl';

// 運動類型枚舉（與後端保持一致）
export enum WorkoutType {
  Resistance = 'resistance',   // 重訓
  Cardio = 'cardio',          // 有氧
  Flexibility = 'flexibility', // 瑜伽/伸展
  Swimming = 'swimming',       // 游泳
  Sports = 'sports',          // 球類運動
  Other = 'other'             // 其他
}

// 有氧運動類型枚舉
export enum CardioType {
  Running = 'running',         // 跑步
  Cycling = 'cycling',         // 騎車
  Walking = 'walking',         // 健走
  Elliptical = 'elliptical',   // 橢圓機
  Rowing = 'rowing',           // 划船機
  Treadmill = 'treadmill',     // 跑步機
  StairClimber = 'stairclimber', // 階梯機
  Other = 'other'              // 其他
}

interface WorkoutTypeConfig {
  type: WorkoutType;
  name: string;
  icon: string;
  description: string;
  available: boolean; // 是否已實現
}

interface WorkoutTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: WorkoutType) => void;
}

export default function WorkoutTypeSelector({ open, onClose, onSelect }: WorkoutTypeSelectorProps) {
  const t = useTranslations();

  const workoutTypes: WorkoutTypeConfig[] = [
    {
      type: WorkoutType.Resistance,
      name: t('workoutType.resistance'),
      icon: '🏋️',
      description: t('workoutType.resistanceDesc'),
      available: true,
    },
    {
      type: WorkoutType.Cardio,
      name: t('workoutType.cardio'),
      icon: '🏃',
      description: t('workoutType.cardioDesc'),
      available: true,
    },
    {
      type: WorkoutType.Flexibility,
      name: t('workoutType.flexibility'),
      icon: '🧘',
      description: t('workoutType.flexibilityDesc'),
      available: false, // 暫未實現
    },
    {
      type: WorkoutType.Swimming,
      name: t('workoutType.swimming'),
      icon: '🏊',
      description: t('workoutType.swimmingDesc'),
      available: false, // 暫未實現
    },
    {
      type: WorkoutType.Sports,
      name: t('workoutType.sports'),
      icon: '⚽',
      description: t('workoutType.sportsDesc'),
      available: false, // 暫未實現
    },
  ];

  const handleSelect = (type: WorkoutType, available: boolean) => {
    if (!available) {
      // 顯示即將推出的提示
      // 這裡可以添加一個 toast 提示
      return;
    }
    onSelect(type);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 模糊背景遮罩 - 點擊可關閉 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* 對話框內容 */}
      <div className="relative bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,.18)] max-w-md w-full max-h-[85vh] overflow-hidden">
        {/* 標題 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            {t('workout.selectWorkoutType')}
          </h2>
        </div>
        
        {/* 運動類型選項 */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {workoutTypes.map((config) => (
            <button
              key={config.type}
              onClick={() => handleSelect(config.type, config.available)}
              disabled={!config.available}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                config.available
                  ? 'border-gray-200 hover:border-[#0A84FF] hover:bg-blue-50 active:scale-95'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{config.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{config.name}</h3>
                    {!config.available && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                        {t('common.comingSoon')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                </div>
                {config.available && (
                  <svg className="w-5 h-5 text-[#0A84FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* 取消按鈕 */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all active:scale-95"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 輔助函數：獲取運動類型的顯示信息
export function getWorkoutTypeInfo(type: WorkoutType, t: (key: string) => string) {
  const configs: Record<WorkoutType, { name: string; icon: string; color: string }> = {
    [WorkoutType.Resistance]: {
      name: t('workoutType.resistance'),
      icon: '🏋️',
      color: 'blue',
    },
    [WorkoutType.Cardio]: {
      name: t('workoutType.cardio'),
      icon: '🏃',
      color: 'green',
    },
    [WorkoutType.Flexibility]: {
      name: t('workoutType.flexibility'),
      icon: '🧘',
      color: 'purple',
    },
    [WorkoutType.Swimming]: {
      name: t('workoutType.swimming'),
      icon: '🏊',
      color: 'cyan',
    },
    [WorkoutType.Sports]: {
      name: t('workoutType.sports'),
      icon: '⚽',
      color: 'orange',
    },
    [WorkoutType.Other]: {
      name: t('workoutType.other'),
      icon: '💪',
      color: 'gray',
    },
  };
  
  return configs[type] || configs[WorkoutType.Other];
}

// 輔助函數：獲取有氧運動類型的顯示信息
export function getCardioTypeInfo(type: CardioType, t: (key: string) => string) {
  const configs: Record<CardioType, { name: string; icon: string }> = {
    [CardioType.Running]: { name: t('cardioType.running'), icon: '🏃' },
    [CardioType.Cycling]: { name: t('cardioType.cycling'), icon: '🚴' },
    [CardioType.Walking]: { name: t('cardioType.walking'), icon: '🚶' },
    [CardioType.Elliptical]: { name: t('cardioType.elliptical'), icon: '⭕' },
    [CardioType.Rowing]: { name: t('cardioType.rowing'), icon: '🚣' },
    [CardioType.Treadmill]: { name: t('cardioType.treadmill'), icon: '🏃‍♂️' },
    [CardioType.StairClimber]: { name: t('cardioType.stairclimber'), icon: '🏔️' },
    [CardioType.Other]: { name: t('cardioType.other'), icon: '💨' },
  };
  
  return configs[type] || configs[CardioType.Other];
}