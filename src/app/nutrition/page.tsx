'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils, NutritionRecord } from '@/lib/api';
import NutritionForm from '@/components/NutritionForm';
import NutritionList from '@/components/NutritionList';
import LocalModeNotice from '@/components/LocalModeNotice';
import AppBackBar from '@/components/AppBackBar';

type ViewMode = 'list' | 'add' | 'edit';

export default function NutritionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<NutritionRecord | null>(null);
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

  const handleAddNew = () => {
    setEditingRecord(null);
    setViewMode('add');
  };

  const handleEdit = (record: NutritionRecord) => {
    setEditingRecord(record);
    setViewMode('edit');
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingRecord(null);
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
      <div className="container mx-auto py-8">
        <LocalModeNotice />
        
        {viewMode === 'list' && (
          <NutritionList 
            onAddNew={handleAddNew}
            onEdit={handleEdit}
          />
        )}
        
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="max-w-4xl mx-auto p-4">
            <AppBackBar onBack={handleCancel} />
            
            <NutritionForm
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
              initialData={editingRecord ? {
                date: editingRecord.date,
                mealType: editingRecord.mealType,
                foods: editingRecord.foods,
                notes: editingRecord.notes,
              } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
} 