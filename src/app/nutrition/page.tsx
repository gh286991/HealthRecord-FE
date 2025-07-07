'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@/store/hooks';
import type { NutritionRecord } from '@/types';
import NutritionForm from '@/components/NutritionForm';
import NutritionList from '@/components/NutritionList';
import LocalModeNotice from '@/components/LocalModeNotice';

type ViewMode = 'list' | 'add' | 'edit';

export default function NutritionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<NutritionRecord | null>(null);
  const router = useRouter();
  const isLoggedIn = useIsAuthenticated();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn, router]);

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
            <div className="mb-6">
              <button
                onClick={handleCancel}
                className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回列表
              </button>
            </div>
            
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