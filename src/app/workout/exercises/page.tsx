'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
import Card from '@/components/Card';
import { useGetBodyPartsQuery, useGetCommonExercisesQuery, useAddUserExerciseMutation, useUpdateUserExerciseMutation, useDeleteUserExerciseMutation } from '@/lib/workoutApi';

type ExerciseItem = { _id: string; name: string; bodyPart?: string; isCustom?: boolean };

export default function ManageExercisesPage() {
  const t = useTranslations();
  
  // 輔助函數：只有在有翻譯鍵值時才使用翻譯，否則使用原始名稱
  const getTranslatedName = (key: string, fallback: string) => {
    // 檢查翻譯鍵值是否以已知的運動項目開頭
    const exerciseKey = key.replace('exercise.', '');
    const knownExercises = [
      'Bench Press', 'Incline Dumbbell Press', 'Dumbbell Flyes', 'Push-ups',
      'Squat', 'Romanian Deadlift', 'Hip Thrust', 'Lunges', 'Leg Press', 'Calf Raises',
      'Deadlift', 'Barbell Row', 'Pull-up', 'Lat Pulldown', 'T-Bar Row',
      'Overhead Press', 'Lateral Raise', 'Rear Delt Flyes', 'Front Raise', 'Shrugs',
      'Biceps Curl', 'Hammer Curl', 'Preacher Curl', 'Triceps Pushdown', 'Overhead Triceps Extension',
      'Close-Grip Bench Press', 'Dips', 'Plank', 'Crunches', 'Russian Twists',
      'Leg Raises', 'Mountain Climbers', 'Burpees', 'Thrusters', 'Clean and Press'
    ];
    
    if (knownExercises.includes(exerciseKey)) {
      return t(key);
    } else {
      return fallback;
    }
  };
  const { data: bodyParts = [] } = useGetBodyPartsQuery();
  const { data: exercises = [] } = useGetCommonExercisesQuery(undefined);
  const [addUser] = useAddUserExerciseMutation();
  const [updateUser] = useUpdateUserExerciseMutation();
  const [deleteUser] = useDeleteUserExerciseMutation();

  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const filtered = useMemo<ExerciseItem[]>(() => {
    const list = (exercises as ExerciseItem[]) || [];
    return activeTab ? list.filter((e: ExerciseItem) => (e.bodyPart || '') === activeTab) : list;
  }, [exercises, activeTab]);

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        {/* 標籤列與新增按鈕並排 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('')} className={`px-3 py-1 rounded-full border ${activeTab === '' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-800 border-gray-300 hover:bg-gray-50'}`}>{t('common.all')}</button>
            {bodyParts.map((b) => (
              <button key={b} onClick={() => setActiveTab(b)} className={`px-3 py-1 rounded-full border ${activeTab === b ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-800 border-gray-300 hover:bg-gray-50'}`}>{t(`bodyPart.${b}`)}</button>
            ))}
          </div>
          {activeTab && (
            <button onClick={() => setFormOpen((v) => !v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formOpen ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {formOpen ? t('workout.collapse') : `＋ ${t('common.add')}`}
            </button>
          )}
        </div>

        {formOpen && activeTab && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded border text-sm">{t(`bodyPart.${activeTab}`)}</div>
              <input className="border rounded px-3 py-2 flex-1 text-gray-900 placeholder:text-gray-400 bg-white" placeholder={t('workout.enterExerciseName')} value={name} onChange={(e) => setName(e.target.value)} />
              <button onClick={async () => { if (!name.trim()) return; await addUser({ name: name.trim(), bodyPart: activeTab }).unwrap(); setName(''); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                {t('common.add')}
              </button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-3">{t('workout.customExerciseNote')}</div>

        <div className="space-y-2">
          {filtered.map((ex: ExerciseItem) => (
            <div key={ex._id} className={`p-3 rounded-lg border ${ex.isCustom ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} flex items-center gap-3 hover:shadow-sm transition-shadow`}>
              <span className={`px-2 py-1 rounded text-xs font-medium ${ex.isCustom ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{t(`bodyPart.${ex.bodyPart || 'other'}`)}</span>
              {ex.isCustom ? (
                <input
                  className="border rounded px-3 py-2 flex-1 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={ex.name}
                  onBlur={async (e) => {
                    const next = e.target.value.trim();
                    if (next && next !== ex.name) {
                      await updateUser({ id: ex._id, body: { name: next } }).unwrap();
                    }
                  }}
                />
              ) : (
                <span className="flex-1 text-gray-800 font-semibold">
                  {getTranslatedName(`exercise.${ex.name}`, ex.name)}
                </span>
              )}
              {ex.isCustom ? (
                <button className="px-3 py-1 text-red-600 text-sm font-medium hover:bg-red-50 rounded transition-colors" onClick={async () => { await deleteUser(ex._id).unwrap(); }}>{t('common.delete')}</button>
              ) : (
                <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">{t('common.default')}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


