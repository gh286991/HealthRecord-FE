'use client';

import BottomSheet from '@/components/BottomSheet';
import { WorkoutExercise } from '@/lib/workoutApi';
import { useGetBodyPartsQuery, useGetCommonExercisesQuery } from '@/lib/workoutApi';
import { useMemo, useState } from 'react';

interface RecordEditorProps {
  date: string;
  setDate: (d: string) => void;
  exercises: WorkoutExercise[];
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>;
}

export default function RecordEditor({ date, setDate, exercises, setExercises }: RecordEditorProps) {
  const { data: bodyParts } = useGetBodyPartsQuery();
  const [pickerBodyPart, setPickerBodyPart] = useState<string>('');
  const { data: commonExercises } = useGetCommonExercisesQuery(pickerBodyPart || undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const totalVolume = useMemo(() => exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0), [exercises]);

  const updateExerciseBodyPart = (idx: number, bp: string) => {
    setExercises((prev) => prev.map((ex, i) => i === idx ? { ...ex, bodyPart: bp } : ex));
  };
  const addSet = (exIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 8 }] } : ex));
  };
  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: ex.sets.filter((_, s) => s !== setIdx) } : ex));
  };
  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, sIdx) => sIdx === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">記錄日期</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
      </div>

      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">動作名稱</label>
                <input value={ex.exerciseName} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">部位</label>
                <select value={ex.bodyPart || ''} onChange={(e) => updateExerciseBodyPart(idx, e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black">
                  <option value="" style={{ color: '#000' }}>未選擇</option>
                  {(bodyParts || []).map((bp) => (
                    <option key={bp} value={bp} style={{ color: '#000' }}>{bp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {ex.sets.map((s, sIdx) => (
                <div key={sIdx} className="flex items-center gap-3 w-full">
                  <div className="flex-1">
                    <label className="sr-only">重量(kg)</label>
                    <input type="number" value={s.weight} onChange={(e) => updateSet(idx, sIdx, 'weight', Number(e.target.value))} className="w-full px-3 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <label className="sr-only">次數</label>
                    <input type="number" min={1} value={s.reps} onChange={(e) => updateSet(idx, sIdx, 'reps', Math.max(1, Number(e.target.value)))} className="w-full px-3 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                  </div>
                  <div className="w-14 flex items-center">
                    <button type="button" onClick={() => removeSet(idx, sIdx)} className="inline-flex items-center justify-center h-12 w-14 rounded-md bg-red-500 hover:bg-red-600 text-white transition">刪除</button>
                  </div>
                </div>
              ))}
              <div className="mt-3 flex">
                <button type="button" onClick={() => addSet(idx)} className="ml-auto px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition">+ 新增一組</button>
              </div>
            </div>
          </div>
        ))}
        <div id="exercise-bottom" />
        <div className="mt-2">
          <button 
            type="button" 
            onClick={() => setIsPickerOpen((v) => !v)} 
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            + 新增動作
          </button>
        </div>
      </div>

      <BottomSheet open={isPickerOpen} onClose={() => setIsPickerOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">選擇部位</label>
            <select value={pickerBodyPart} onChange={(e) => setPickerBodyPart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent text-black">
              <option value="" style={{ color: '#000' }}>全部</option>
              {(bodyParts || []).map((bp) => (
                <option key={bp} value={bp} style={{ color: '#000' }}>{bp}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">選擇常用動作</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-auto pr-1">
              {(commonExercises || []).map((ex) => (
                <button
                  key={ex._id}
                  type="button"
                  onClick={() => {
                    setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
                    setIsPickerOpen(false);
                  }}
                  className="px-3 py-2 border rounded hover:bg-gray-50 text-sm text-black transition text-left"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mt-4">
        <div className="text-sm text-gray-700">目前總訓練量：<span className="font-semibold text-green-700">{totalVolume}</span></div>
      </div>
    </div>
  );
}


