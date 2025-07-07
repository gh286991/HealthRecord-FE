'use client';

import { useState } from 'react';
import { useGetNutritionRecordsQuery, useDeleteNutritionRecordMutation } from '@/store/api/healthApi';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import type { NutritionRecord } from '@/types';
import Image from 'next/image';

interface NutritionListProps {
  onAddNew?: () => void;
  onEdit?: (record: NutritionRecord) => void;
}

const mealTypeLabels = {
  '早餐': { label: '早餐', icon: '🌅', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '午餐': { label: '午餐', icon: '☀️', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  '晚餐': { label: '晚餐', icon: '🌙', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  '點心': { label: '點心', icon: '🍎', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default function NutritionList({ onAddNew, onEdit }: NutritionListProps) {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMealType, setFilterMealType] = useState<string>('all');

  // RTK Query hooks
  const { 
    data: dailyData, 
    isLoading: loading, 
    error,
    refetch 
  } = useGetNutritionRecordsQuery({ date: selectedDate });

  const [deleteRecord] = useDeleteNutritionRecordMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除這筆飲食紀錄嗎？')) return;

    try {
      await deleteRecord(id).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: '✅ 紀錄已刪除',
      }));
      refetch();
    } catch (error) {
      console.error('刪除紀錄失敗:', error);
      dispatch(addNotification({
        type: 'error',
        message: '❌ 刪除失敗，請稍後再試',
      }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 過濾記錄
  const filteredRecords = dailyData?.records?.filter(record => 
    filterMealType === 'all' || record.mealType === filterMealType
  ) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">載入失敗</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 標題和新增按鈕 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">飲食紀錄</h1>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增紀錄
          </button>
        )}
      </div>

      {/* 日期選擇和篩選 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">選擇日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">餐次篩選</label>
            <select
              value={filterMealType}
              onChange={(e) => setFilterMealType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">全部餐次</option>
              <option value="早餐">早餐</option>
              <option value="午餐">午餐</option>
              <option value="晚餐">晚餐</option>
              <option value="點心">點心</option>
            </select>
          </div>
        </div>
      </div>

      {/* 每日營養摘要 */}
      {dailyData?.dailyTotals && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            今日營養摘要
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dailyData.dailyTotals.totalCalories}</div>
              <div className="text-sm text-gray-600 mt-1">卡路里</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dailyData.dailyTotals.totalProtein.toFixed(1)}g</div>
              <div className="text-sm text-gray-600 mt-1">蛋白質</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{dailyData.dailyTotals.totalCarbohydrates.toFixed(1)}g</div>
              <div className="text-sm text-gray-600 mt-1">碳水化合物</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{dailyData.dailyTotals.totalFat.toFixed(1)}g</div>
              <div className="text-sm text-gray-600 mt-1">脂肪</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              共 {dailyData.dailyTotals.mealCount} 筆紀錄
            </span>
          </div>
        </div>
      )}

      {/* 飲食紀錄列表 */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-gray-300 text-8xl mb-6">🍽️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              {filterMealType === 'all' ? '今天還沒有飲食紀錄' : `今天還沒有${mealTypeLabels[filterMealType as keyof typeof mealTypeLabels]?.label}紀錄`}
            </h3>
            <p className="text-gray-600 mb-6">開始記錄你的飲食，建立健康生活習慣！</p>
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新增第一筆紀錄
              </button>
            )}
          </div>
        ) : (
          filteredRecords.map((record) => {
            const mealInfo = mealTypeLabels[record.mealType];
            
            return (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* 紀錄標題 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${mealInfo.color}`}>
                        <span className="mr-1">{mealInfo.icon}</span>
                        {mealInfo.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="編輯"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="刪除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 營養摘要 */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{record.totalCalories}</div>
                      <div className="text-xs text-gray-600">卡路里</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{record.totalProtein.toFixed(1)}g</div>
                      <div className="text-xs text-gray-600">蛋白質</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">{record.totalCarbohydrates.toFixed(1)}g</div>
                      <div className="text-xs text-gray-600">碳水</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{record.totalFat.toFixed(1)}g</div>
                      <div className="text-xs text-gray-600">脂肪</div>
                    </div>
                  </div>

                  {/* 食物清單 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">食物清單:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.foods.map((food, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700">{food.foodName}</span>
                          <div className="text-xs text-gray-500">
                            {food.quantity} 份 • {food.calories} 卡
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 照片 */}
                  {record.photoUrl && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">照片:</h4>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={record.photoUrl}
                          alt="飲食照片"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* 備註 */}
                  {record.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">備註:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 