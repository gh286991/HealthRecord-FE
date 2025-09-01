'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutExercise, BodyPart } from '@/lib/workoutApi';
import { useGetBodyPartsQuery, useGetCommonExercisesQuery } from '@/lib/workoutApi';
import { useCreateWorkoutPlanMutation, useUpdateWorkoutPlanMutation, useCreateWorkoutPlansBulkMutation, WorkoutPlan } from '@/lib/workoutPlanApi';
import IOSDualWheelPicker from '@/components/ios/IOSDualWheelPicker';
// 改為點擊輸入框彈出日曆，不再使用滾輪式 DatePicker
// import IOSDatePicker from '@/components/ios/IOSDatePicker';
import IOSCalendar from '@/components/ios/IOSCalendar';

interface WorkoutPlanFormProps {
  plan?: WorkoutPlan | null;
  onClose: () => void;
}

export default function WorkoutPlanForm({ plan, onClose }: WorkoutPlanFormProps) {
  const [name, setName] = useState('');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set()); // 1=Mon..6=Sat, 0=Sun
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { data: bodyParts } = useGetBodyPartsQuery();
  const { data: commonExercises } = useGetCommonExercisesQuery();

  const [createPlan, { isLoading: isCreating }] = useCreateWorkoutPlanMutation();
  const [createBulk] = useCreateWorkoutPlansBulkMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateWorkoutPlanMutation();

  useEffect(() => {
    if (plan) {
      setName(plan.name || '');
      setPlannedDate(new Date(plan.plannedDate).toISOString().split('T')[0]);
      setExercises(plan.exercises);
      setRecurrence('none');
      setEndDate(new Date(plan.plannedDate).toISOString().split('T')[0]);
    } else {
      setName('');
      setPlannedDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setRecurrence('none');
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  }, [plan]);

  const addExercise = (exercise: { _id: string; name: string; bodyPart?: string }) => {
    setExercises(prev => [...prev, { 
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      bodyPart: (exercise.bodyPart as BodyPart | undefined),
      sets: [{ weight: 0, reps: 8 }]
    }]);
    setIsPickerOpen(false);
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const newSets = ex.sets.map((s, sI) => sI === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets: newSets };
    }));
  };

  const addSet = (exIdx: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const lastSet = ex.sets[ex.sets.length - 1] || { weight: 0, reps: 8 };
      return { ...ex, sets: [...ex.sets, { ...lastSet }] };
    }));
  };

  const removeExercise = (exIdx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  };

  const handleSubmit = async () => {
    const baseName = (name && name.trim().length > 0) ? name.trim() : (plan?.name || `課表 ${plannedDate}`);
    try {
      if (plan) {
        // 單筆更新
        await updatePlan({ id: plan._id, body: { name: baseName, plannedDate, exercises } }).unwrap();
      } else {
        if (recurrence === 'none') {
          await createPlan({ name: baseName, plannedDate, exercises }).unwrap();
        } else {
          const payload = {
            name: baseName,
            exercises,
            startDate: plannedDate,
            endDate,
            recurrence,
            weekdays: Array.from(weekdays.values()),
          } as const;
          const res = await createBulk(payload).unwrap();
          if (!res || res.created === 0) {
            alert('週期設定沒有任何符合的日期，請調整星期或結束日期');
            return;
          }
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save workout plan:', error);
      alert('儲存失敗，請檢查內容後再試一次。');
    }
  };

  const previewDates = useMemo(() => {
    const list: string[] = [];
    const start = new Date(plannedDate);
    const end = new Date(endDate);
    end.setHours(0,0,0,0);
    if (recurrence === 'none') return [plannedDate];
    const cursor = new Date(start);
    while (cursor <= end) {
      if (recurrence === 'daily') {
        list.push(cursor.toISOString().split('T')[0]);
      } else if (recurrence === 'weekly') {
        const dow = cursor.getDay();
        if (weekdays.has(dow)) list.push(cursor.toISOString().split('T')[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return list;
  }, [plannedDate, endDate, recurrence, weekdays]);

  const toggleWeekday = (d: number) => {
    setWeekdays(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  };

  // 當切換週期或變更開始日期時，自動帶入合理預設（避免沒有日期可建立）
  useEffect(() => {
    try {
      if (recurrence === 'daily') {
        const start = new Date(plannedDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        setEndDate(end.toISOString().split('T')[0]);
      } else if (recurrence === 'weekly') {
        const start = new Date(plannedDate);
        if (weekdays.size === 0) {
          const wd = start.getDay();
          setWeekdays(new Set([wd]));
        }
        const end = new Date(start);
        end.setDate(end.getDate() + 28);
        setEndDate(end.toISOString().split('T')[0]);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurrence, plannedDate]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
        <h2 className="text-xl font-bold mb-4">{plan ? '編輯課表' : '建立新課表'}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">課表名稱</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="例如：胸推循環訓練" />
          </div>
          <div>
            <label className="block text-sm font-medium">開始日期</label>
            <button
              type="button"
              onClick={() => setStartPickerOpen(true)}
              className="mt-1 w-full text-left px-3 py-2 border rounded-md flex items-center justify-between"
            >
              <span>{new Date(plannedDate).toLocaleDateString('zh-TW')}</span>
              <span className="text-gray-500">📅</span>
            </button>
          </div>

          {/* 週期設定 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">週期設定</label>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded-md text-sm border ${recurrence==='none'?'bg-gray-800 text-white':'bg-white text-gray-700'}`} onClick={() => setRecurrence('none')}>單次</button>
              <button className={`px-3 py-1 rounded-md text-sm border ${recurrence==='daily'?'bg-gray-800 text-white':'bg-white text-gray-700'}`} onClick={() => setRecurrence('daily')}>每天</button>
              <button className={`px-3 py-1 rounded-md text-sm border ${recurrence==='weekly'?'bg-gray-800 text-white':'bg-white text-gray-700'}`} onClick={() => setRecurrence('weekly')}>每週</button>
            </div>
            {recurrence === 'weekly' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['日','一','二','三','四','五','六'].map((w, idx) => (
                  <button key={w} onClick={() => toggleWeekday(idx)} className={`px-3 py-1 rounded-full text-sm border ${weekdays.has(idx)?'bg-amber-500 text-white border-amber-500':'bg-white text-gray-700'}`}>週{w}</button>
                ))}
              </div>
            )}
            {(recurrence === 'daily' || recurrence === 'weekly') && (
              <div className="mt-2">
                <label className="block text-sm text-gray-700">結束日期</label>
                <button
                  type="button"
                  onClick={() => setEndPickerOpen(true)}
                  className="mt-1 w-full text-left px-3 py-2 border rounded-md flex items-center justify-between"
                >
                  <span>{new Date(endDate).toLocaleDateString('zh-TW')}</span>
                  <span className="text-gray-500">📅</span>
                </button>
                <div className="text-xs text-gray-600 mt-1">將建立 {previewDates.length} 筆</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">動作列表</h3>
            {exercises.map((ex, exIdx) => (
              <div key={ex.exerciseId + exIdx} className="p-3 border rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">{ex.exerciseName}</p>
                  <button onClick={() => removeExercise(exIdx)} className="text-red-500 hover:text-red-700 text-sm">移除</button>
                </div>
                <div className="space-y-2">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span className="font-mono text-sm">組 {setIdx + 1}</span>
                      <input type="number" value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', +e.target.value)} className="w-20 px-2 py-1 border rounded-md" placeholder="kg" />
                      <span>kg x</span>
                      <input type="number" value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', +e.target.value)} className="w-20 px-2 py-1 border rounded-md" placeholder="reps" />
                      <span>次</span>
                    </div>
                  ))}
                   <button onClick={() => addSet(exIdx)} className="text-sm text-blue-600 hover:text-blue-800 mt-1">+ 新增一組</button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsPickerOpen(true)} className="w-full py-2 px-4 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-100">
            + 新增動作
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">取消</button>
          <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
            {isCreating || isUpdating ? '儲存中...' : '儲存課表'}
          </button>
        </div>
      </div>

      <IOSDualWheelPicker
        open={isPickerOpen}
        title="新增動作"
        bodyParts={bodyParts || []}
        exercises={(commonExercises || []).map(e => ({ _id: e._id, name: e.name, bodyPart: e.bodyPart }))}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={addExercise}
      />

      {/* 開始日期日曆彈窗 */}
      {startPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 shadow-xl w-full max-w-sm">
            <IOSCalendar
              selectedDate={plannedDate}
              onChange={(d) => { setPlannedDate(d); setStartPickerOpen(false); }}
            />
            <div className="mt-2 text-right">
              <button onClick={() => setStartPickerOpen(false)} className="px-3 py-1 text-sm text-gray-600">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* 結束日期日曆彈窗 */}
      {endPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 shadow-xl w-full max-w-sm">
            <IOSCalendar
              selectedDate={endDate}
              onChange={(d) => { setEndDate(d); setEndPickerOpen(false); }}
            />
            <div className="mt-2 text-right">
              <button onClick={() => setEndPickerOpen(false)} className="px-3 py-1 text-sm text-gray-600">關閉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
