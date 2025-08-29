'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { NutritionRecord } from '@/lib/api';
import { 
  useGetNutritionRecordsQuery, 
  useGetMarkedDatesQuery,
  useDeleteNutritionRecordMutation
} from '@/lib/nutritionApi';
import { getSafeImageProps } from '@/lib/imageUtils';
import IOSCalendar from '@/components/ios/IOSCalendar';
import IOSWeekStrip from '@/components/ios/IOSWeekStrip';
import Card from '@/components/Card';
import QuickMealEntry from './QuickMealEntry';

interface ImprovedNutritionListProps {
  onAddNew: () => void;
  onEdit: (record: NutritionRecord) => void;
}

const mealTypeIcons = {
  '早餐': '🌅',
  '午餐': '☀️',
  '晚餐': '🌙',
  '點心': '🍎',
};

export default function ImprovedNutritionList({ onEdit }: ImprovedNutritionListProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickMealType, setQuickMealType] = useState<'早餐' | '午餐' | '晚餐' | '點心' | null>(null);
  const [isMealPickerOpen, setIsMealPickerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // 餐次選擇開啟時鎖定背景滾動
  useEffect(() => {
    if (!isMealPickerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMealPickerOpen]);

  // 月曆開啟時鎖定背景滾動
  useEffect(() => {
    if (!isCalendarOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isCalendarOpen]);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date(selectedDate).getFullYear(),
    month: new Date(selectedDate).getMonth() + 1,
  });

  // RTK Query hooks
  const { 
    data: records = [], 
    isLoading: loading, 
    refetch: refetchRecords 
  } = useGetNutritionRecordsQuery({ date: selectedDate });

  const { 
    data: markedDates = [] 
  } = useGetMarkedDatesQuery(currentMonth);

  const [deleteNutritionRecord] = useDeleteNutritionRecordMutation();


  // 監聽選中日期變化，更新當前月份
  useEffect(() => {
    const newYear = new Date(selectedDate).getFullYear();
    const newMonth = new Date(selectedDate).getMonth() + 1;
    if (newYear !== currentMonth.year || newMonth !== currentMonth.month) {
      setCurrentMonth({ year: newYear, month: newMonth });
    }
  }, [selectedDate, currentMonth]);

  const handleQuickSave = async (mealData: {
    mealType: string;
    date: string;
    foods: Array<{
      foodName: string;
      description: string;
      calories: number;
    }>;
    notes?: string;
  }) => {
    try {
      // 創建記錄數據
      const recordData = {
        ...mealData,
        date: selectedDate, // 使用當前選中的日期
      };

      // 保存到本地存儲
      const localRecord = {
        _id: Date.now().toString(),
        userId: 'local-user',
        ...recordData,
        totalCalories: mealData.foods.reduce((sum: number, food) => sum + (food.calories || 0), 0),
        totalProtein: 0,
        totalCarbohydrates: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
        photoUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingRecords = localStorage.getItem('nutrition-records');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(localRecord);
      localStorage.setItem('nutrition-records', JSON.stringify(records));
      
      setQuickMealType(null);
      refetchRecords(); // 重新加載記錄
    } catch (error) {
      console.error('快速保存失敗:', error);
      alert('保存失敗，請稍後再試');
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('確定要刪除這筆記錄嗎？')) return;

    try {
      // 使用 RTK Query mutation 刪除
      await deleteNutritionRecord(recordId).unwrap();
      // RTK Query 會自動更新緩存，但為確保也手動觸發重新獲取
      refetchRecords();
      alert('記錄已刪除');
    } catch (error) {
      console.error('刪除失敗:', error);
      // 如果 API 失敗，fallback 到本地存儲刪除
      try {
        const existingRecords = localStorage.getItem('nutrition-records');
        if (existingRecords) {
          const allRecords: NutritionRecord[] = JSON.parse(existingRecords);
          const filteredRecords = allRecords.filter(record => record._id !== recordId);
          localStorage.setItem('nutrition-records', JSON.stringify(filteredRecords));
        }
        // 手動觸發重新獲取資料
        refetchRecords();
        alert('記錄已刪除');
      } catch (localError) {
        console.error('本地刪除失敗:', localError);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  const getTotalCaloriesForDate = () => {
    return records.reduce((sum, record) => sum + (record.totalCalories || 0), 0);
  };

  const getDailyTotals = () => {
    return records.reduce(
      (totals, record) => ({
        totalCalories: totals.totalCalories + (record.totalCalories || 0),
        totalProtein: totals.totalProtein + (record.totalProtein || 0),
        totalCarbohydrates: totals.totalCarbohydrates + (record.totalCarbohydrates || 0),
        totalFat: totals.totalFat + (record.totalFat || 0),
        totalFiber: totals.totalFiber + (record.totalFiber || 0),
        totalSugar: totals.totalSugar + (record.totalSugar || 0),
        totalSodium: totals.totalSodium + (record.totalSodium || 0),
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0 },
    );
  };

  const formatRecordTime = (record: NutritionRecord) => {
    const iso = record.createdAt || record.date;
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    try {
      return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 標題 */}
      <div className="h-2" />
      
      {/* 日期選擇器和統計 */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-full max-w-2xl flex items-center justify-between">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="開啟日曆"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <div className="text-xl font-bold text-gray-900">今天 {new Date(selectedDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric'})}</div>
            <button
              onClick={() => setIsMealPickerOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="新增"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
            </button>
          </div>
          <div className="w-full max-w-2xl">
            <IOSWeekStrip selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="w-full max-w-2xl">
            <Card className="p-3">
              <div className="grid grid-cols-7 divide-x divide-gray-100">
                <div className="text-center px-2">
                  <div className="text-[10px] text-gray-500">攝取 / 今日</div>
                  <div className="text-lg font-semibold text-green-600">{getTotalCaloriesForDate()}</div>
                  <div className="text-[10px] text-gray-400">卡路里</div>
                </div>
                {(() => {
                  const totals = getDailyTotals();
                  return (
                    <>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalProtein}</div>
                        <div className="text-[10px] text-gray-400">蛋白質</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalCarbohydrates}</div>
                        <div className="text-[10px] text-gray-400">碳水</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalFat}</div>
                        <div className="text-[10px] text-gray-400">脂肪</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalFiber}</div>
                        <div className="text-[10px] text-gray-400">纖維</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalSugar}</div>
                        <div className="text-[10px] text-gray-400">糖分</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-[10px] text-gray-500">今日</div>
                        <div className="text-base font-semibold text-gray-800">{totals.totalSodium}</div>
                        <div className="text-[10px] text-gray-400">鈉</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有記錄</h3>
            <p className="text-gray-600 mb-6">點擊上方按鈕開始記錄你的飲食吧！</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow max-w-full overflow-hidden">
              {/* 頂部資訊列 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-2xl mr-3">{mealTypeIcons[record.mealType as keyof typeof mealTypeIcons]}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{record.mealType}</h3>
                    <p className="text-sm text-gray-600">{formatRecordTime(record)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{record.totalCalories}</div>
                    <div className="text-xs text-gray-500">卡路里</div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // 使用帶有完整營養素字段的記錄資料進行編輯
                        const completeRecord = {
                          ...record,
                          foods: record.foods.map(food => ({
                            ...food,
                            protein: food.protein || 0,
                            carbohydrates: food.carbohydrates || 0,
                            fat: food.fat || 0,
                            fiber: food.fiber || 0,
                            sugar: food.sugar || 0,
                            sodium: food.sodium || 0,
                          }))
                        };
                        onEdit(completeRecord);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* 食物列表 */}
              {record.foods && record.foods.length > 0 && (
                <div className="space-y-2 mb-4">
                  {record.foods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{food.foodName}</span>
                        {food.description && (
                          <span className="text-gray-600 ml-2">({food.description})</span>
                        )}
                      </div>
                      <div className="text-sm text-green-600 font-medium ml-2">
                        {food.calories} 卡
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 圖片 - 響應式設計 */}
              {record.photoUrl && (
                <div className="mb-4">
                  <div className="relative w-full max-w-sm mx-auto">
                    <Image
                      {...getSafeImageProps(record.photoUrl)}
                      alt="餐點照片"
                      width={320}
                      height={240}
                      className="w-full h-auto max-h-60 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* 備註 */}
              {record.notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 快速記錄彈窗 */}
      {quickMealType && (
        <QuickMealEntry
          mealType={quickMealType}
          onSave={handleQuickSave}
          onCancel={() => setQuickMealType(null)}
        />
      )}

      {/* 餐次選擇彈窗 */}
      {isMealPickerOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">選擇餐次</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(mealTypeIcons) as Array<keyof typeof mealTypeIcons>).map((mealType) => (
                <button
                  key={mealType}
                  onClick={() => {
                    setIsMealPickerOpen(false);
                    setQuickMealType(mealType);
                  }}
                  className="bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-2 border-green-200 hover:border-green-300 rounded-xl p-4 text-center transition-all duration-200"
                >
                  <div className="text-2xl mb-1">{mealTypeIcons[mealType]}</div>
                  <div className="text-sm font-medium text-gray-700">{mealType}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMealPickerOpen(false)}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 月曆彈窗（僅切換日期） */}
      {isCalendarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <IOSCalendar
              selectedDate={selectedDate}
              markedDates={markedDates}
              onChange={(d) => {
                setSelectedDate(d);
                setIsCalendarOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}