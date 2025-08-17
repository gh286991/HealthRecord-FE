'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenUtils } from '@/lib/api';
import { WorkoutRecord, WorkoutExercise, useCreateWorkoutMutation, useGetWorkoutListQuery, useUpdateWorkoutMutation, useGetBodyPartsQuery, useGetCommonExercisesQuery } from '@/lib/workoutApi';

type ViewMode = 'list' | 'add' | 'edit';

export default function WorkoutPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: listData, refetch } = useGetWorkoutListQuery({ date: selectedDate });
  const [createWorkout] = useCreateWorkoutMutation();
  const [updateWorkout] = useUpdateWorkoutMutation();
  const router = useRouter();

  useEffect(() => {
    const loggedIn = tokenUtils.isLoggedIn();
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push('/login');
      return;
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      await refetch();
    } catch (e) {
      console.error('取得健身紀錄失敗', e);
    }
  }, [refetch]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData();
  }, [selectedDate, isLoggedIn, fetchData]);

  const handleAdd = () => {
    setEditingRecord(null);
    setViewMode('add');
  };

  const handleEdit = (r: WorkoutRecord) => {
    setEditingRecord(r);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingRecord(null);
  };

  const handleSubmit = async (payload: { date: string; exercises: WorkoutExercise[]; notes?: string }) => {
    try {
      if (editingRecord) await updateWorkout({ id: editingRecord._id, body: payload }).unwrap();
      else await createWorkout(payload).unwrap();
      await fetchData();
      setViewMode('list');
      setEditingRecord(null);
    } catch (e) {
      console.error('儲存健身紀錄失敗', e);
      alert('儲存失敗，請稍後再試');
    }
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
      <div className="container mx-auto py-8 px-4">
        {viewMode === 'list' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">健身紀錄</h1>
              <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新增紀錄
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇日期</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                </div>
                {listData?.dailyTotals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{listData.dailyTotals.totalVolume}</div>
                      <div className="text-sm text-gray-600 mt-1">總訓練量</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{listData.dailyTotals.totalSets}</div>
                      <div className="text-sm text-gray-600 mt-1">總組數</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{listData.dailyTotals.totalReps}</div>
                      <div className="text-sm text-gray-600 mt-1">總次數</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{listData.dailyTotals.recordCount}</div>
                      <div className="text-sm text-gray-600 mt-1">筆數</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {(((listData?.records?.length ?? 0) === 0)) ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="text-gray-300 text-8xl mb-6">🏋️</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">今天還沒有健身紀錄</h3>
                  <p className="text-gray-600 mb-6">開始記錄你的訓練！</p>
                  <button onClick={handleAdd} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新增第一筆紀錄
                  </button>
                </div>
              ) : (
                (listData?.records ?? []).map((r: WorkoutRecord) => (
                  <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString('zh-TW')}</div>
                      <div className="space-x-2">
                        <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {r.exercises.map((ex: WorkoutExercise, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-2">{ex.exerciseName}</div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm text-gray-700">
                            {ex.sets.map((s: { weight: number; reps: number }, sIdx: number) => (
                              <div key={sIdx} className="bg-gray-50 rounded p-2 text-center">
                                <div>{s.weight} kg</div>
                                <div className="text-gray-500">x {s.reps}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-green-600">{r.totalVolume}</div>
                          <div className="text-xs text-gray-600 mt-1">總量</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-blue-600">{r.totalSets}</div>
                          <div className="text-xs text-gray-600 mt-1">組數</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-orange-600">{r.totalReps}</div>
                          <div className="text-xs text-gray-600 mt-1">次數</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
              <button onClick={handleCancel} className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回列表
              </button>
            </div>
            <WorkoutForm
              initialData={editingRecord ? { date: editingRecord.date.split('T')[0], exercises: editingRecord.exercises, notes: editingRecord.notes } : undefined}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutForm({ initialData, onCancel, onSubmit }: {
  initialData?: { date?: string; exercises?: WorkoutExercise[]; notes?: string };
  onCancel: () => void;
  onSubmit: (payload: { date: string; exercises: WorkoutExercise[]; notes?: string }) => void;
}) {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialData?.exercises || [
    { exerciseName: 'Bench Press', exerciseId: '', sets: [{ weight: 40, reps: 10 }] },
  ]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const { data: bodyParts } = useGetBodyPartsQuery();
  const [pickerBodyPart, setPickerBodyPart] = useState<string>('');
  const { data: commonExercises } = useGetCommonExercisesQuery(pickerBodyPart || undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  let toastTimerRef: number | undefined;
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef) window.clearTimeout(toastTimerRef);
    toastTimerRef = window.setTimeout(() => setToast(null), 1200) as unknown as number;
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    showToast('已移除動作');
  };

  const updateExerciseName = (idx: number, name: string) => {
    setExercises((prev) => prev.map((ex, i) => i === idx ? { ...ex, exerciseName: name } : ex));
  };

  const updateExerciseBodyPart = (idx: number, bp: string) => {
    setExercises((prev) => prev.map((ex, i) => i === idx ? { ...ex, bodyPart: bp } : ex));
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] } : ex));
    showToast('已新增一組');
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: ex.sets.filter((_, s) => s !== setIdx) } : ex));
    showToast('已刪除一組');
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, sIdx) => sIdx === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const totalVolume = exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{initialData ? '編輯健身紀錄' : '新增健身紀錄'}</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">記錄日期</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">訓練項目</label>
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">動作名稱</label>
                  <input value={ex.exerciseName} onChange={(e) => updateExerciseName(idx, e.target.value)} placeholder="Bench Press / Squat / Deadlift..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
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
                {exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(idx)} className="text-red-600 hover:text-red-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">重量(kg)</label>
                      <input type="number" value={s.weight} onChange={(e) => updateSet(idx, sIdx, 'weight', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">次數</label>
                      <input type="number" value={s.reps} onChange={(e) => updateSet(idx, sIdx, 'reps', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
                    </div>
                    <div className="flex items-end gap-2">
                      <button type="button" onClick={() => removeSet(idx, sIdx)} className="text-red-600 hover:text-red-800 transition active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => addSet(idx)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition active:scale-95">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        新增組次
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div id="exercise-bottom" />
          {/* 置於清單與備註之間的大按鈕與選擇器 */}
          <div className="mt-2">
            <button type="button" onClick={() => setIsPickerOpen((v) => !v)} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold shadow active:scale-95">+ 新增動作</button>
          </div>
          {isPickerOpen && (
            <div className="border rounded-lg p-4 bg-white mt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇部位</label>
                  <select value={pickerBodyPart} onChange={(e) => setPickerBodyPart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black">
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
                          setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 0 }] }]);
                          setIsPickerOpen(false);
                          showToast(`已加入：${ex.name}`);
                          try { document.getElementById('exercise-bottom')?.scrollIntoView({ behavior: 'smooth' }); } catch {}
                        }}
                        className="px-3 py-2 border rounded hover:bg-gray-50 text-sm text-black transition active:scale-95 text-left"
                      >
                        {ex.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button type="button" onClick={() => { setExercises((prev) => [...prev, { exerciseName: '', bodyPart: pickerBodyPart || undefined, exerciseId: '', sets: [{ weight: 0, reps: 0 }] }]); setIsPickerOpen(false); }} className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50 transition active:scale-95">或加入空白動作</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" placeholder="感受、節奏、等..." />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mt-4">
          <div className="text-sm text-gray-700">目前總訓練量：<span className="font-semibold text-green-700">{totalVolume}</span></div>
        </div>

        <div className="flex gap-4 pt-6">
          <button onClick={onCancel} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors active:scale-95">取消</button>
          <button onClick={() => onSubmit({ date, exercises, notes })} className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 active:scale-95">{initialData ? '儲存變更' : '新增紀錄'}</button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}



