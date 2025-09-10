'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils } from '@/lib/api';
import type { NutritionRecord as NutritionRecordApi } from '@/lib/nutritionApi';
import SimplifiedNutritionForm from '@/components/SimplifiedNutritionForm';
import ImprovedNutritionList from '@/components/ImprovedNutritionList';
import AppBackBar from '@/components/AppBackBar';

type ViewMode = 'list' | 'add' | 'edit';

export default function NutritionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<NutritionRecordApi | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = tokenUtils.isLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleAddNew = (date: string) => {
    setEditingRecord(null);
    setSelectedDate(date);
    setViewMode('add');
  };

  const handleEdit = (record: NutritionRecordApi) => {
    setEditingRecord(record);
    setViewMode('edit');
  };

  const handleFormSuccess = (updatedRecord: NutritionRecordApi) => {
    if (editingRecord) {
      // 編輯模式：更新編輯中的記錄資料，停留在編輯模式
      setEditingRecord(updatedRecord);
      // 不改變 viewMode，保持在編輯模式
    } else {
      // 新增模式：回到列表模式
      setViewMode('list');
    }
    // RTK Query 會自動更新快取，不需要手動重新加載
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingRecord(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證登入狀態中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto">
        {viewMode === 'list' && (
          <ImprovedNutritionList 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
          />
        )}
        
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="max-w-4xl mx-auto p-4">
            <AppBackBar onBack={handleCancel} />
            
            <SimplifiedNutritionForm
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
              recordId={editingRecord?._id}
              initialData={editingRecord ? {
                date: editingRecord.date,
                mealType: editingRecord.mealType,
                foods: editingRecord.foods.map(food => ({
                  foodName: food.foodName,
                  description: food.description || '',
                  calories: food.calories || 0,
                  protein: food.protein || 0,
                  carbohydrates: food.carbohydrates || 0,
                  fat: food.fat || 0,
                  fiber: food.fiber || 0,
                  sugar: food.sugar || 0,
                  sodium: food.sodium || 0,
                })),
                notes: editingRecord.notes || '',
                price: editingRecord.price,
                photoUrl: editingRecord.photoUrl, // For backward compatibility
                photoUrls: editingRecord.photoUrls, // Pass the new field
              } : { date: selectedDate }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 