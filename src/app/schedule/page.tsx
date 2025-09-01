'use client';

import React, { useState } from 'react';
import { useGetWorkoutPlansQuery, useDeleteWorkoutPlanMutation, WorkoutPlan } from '@/lib/workoutPlanApi';
import WorkoutPlanList from './components/WorkoutPlanList';
import WorkoutPlanForm from './components/WorkoutPlanForm';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function SchedulePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: workoutPlans, error, isLoading, refetch } = useGetWorkoutPlansQuery();
  const [deletePlan] = useDeleteWorkoutPlanMutation();

  const handleOpenForm = (plan: WorkoutPlan | null = null) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
    refetch(); // Refetch data when form is closed to see changes
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        await deletePlan(deletingId).unwrap();
        setDeletingId(null);
      } catch (err) {
        console.error('Failed to delete the plan:', err);
        alert('刪除失敗');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        
        <button 
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ＋ 建立新課表
        </button>
      </div>

      {isLoading && <p>載入中...</p>}
      {error && <p className="text-red-500">讀取課表失敗，請稍後再試。</p>}
      
      {workoutPlans && workoutPlans.length > 0 && (
        <WorkoutPlanList 
          plans={workoutPlans} 
          onEdit={handleOpenForm} 
          onDelete={handleDeleteRequest} 
        />
      )}

      {workoutPlans && workoutPlans.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">您目前沒有任何課表。點擊右上角按鈕來建立一個吧！</p>
        </div>
      )}

      {isFormOpen && (
        <WorkoutPlanForm plan={editingPlan} onClose={handleCloseForm} />
      )}

      <ConfirmDialog
        open={!!deletingId}
        title="確認刪除"
        message="您確定要刪除這個課表嗎？此動作無法復原。"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
