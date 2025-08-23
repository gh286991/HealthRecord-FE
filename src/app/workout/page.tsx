'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { useRouter, useSearchParams } from 'next/navigation';
import IOSDatePicker from '@/components/ios/IOSDatePicker';
import IOSDualWheelPicker from '@/components/ios/IOSDualWheelPicker';
import IOSNumericKeypad from '@/components/ios/IOSNumericKeypad';
import { tokenUtils } from '@/lib/api';
import { WorkoutRecord, WorkoutExercise, useCreateWorkoutMutation, useGetWorkoutListQuery, useUpdateWorkoutMutation, useGetBodyPartsQuery, useGetCommonExercisesQuery, useDeleteWorkoutMutation } from '@/lib/workoutApi';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FocusMode from '@/components/workout/FocusMode';
// import RecordEditor from '@/components/workout/RecordEditor';
import Toast from '@/components/Toast';
import SwipeRow from '@/components/SwipeRow';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useWorkoutTimer } from '@/components/WorkoutTimerContext';

type ViewMode = 'list' | 'add' | 'edit';

export default function WorkoutPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: listData, refetch } = useGetWorkoutListQuery({ date: selectedDate });
  const [createWorkout] = useCreateWorkoutMutation();
  const [updateWorkout] = useUpdateWorkoutMutation();
  const [deleteWorkout] = useDeleteWorkoutMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'error'>('default');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
    try { router.push('/workout?form=add'); } catch { }
  };

  const handleEdit = (r: WorkoutRecord) => {
    setEditingRecord(r);
    setViewMode('edit');
    try { router.push('/workout?form=edit'); } catch { }
  };

  const requestDelete = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteWorkout(confirmId).unwrap();
      await fetchData();
      setToastVariant('success');
      setToastMsg('紀錄已刪除');
      setToastOpen(true);
    } catch (e) {
      console.error('刪除紀錄失敗', e);
      setToastVariant('error');
      setToastMsg('刪除失敗，請稍後再試');
      setToastOpen(true);
    } finally {
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingRecord(null);
    try { router.push('/workout'); } catch { }
  };

  const handleSubmit = async (payload: { date: string; exercises: WorkoutExercise[]; notes?: string; workoutDurationSeconds?: number; totalRestSeconds?: number }) => {
    try {
      const ensuredTotalRestSeconds = typeof payload.totalRestSeconds === 'number'
        ? payload.totalRestSeconds
        : (payload.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).reduce((s, set) => s + (set.restSeconds || 0), 0), 0);
      const bodyWithDurations = { ...payload, totalRestSeconds: ensuredTotalRestSeconds };
      if (editingRecord) await updateWorkout({ id: editingRecord._id, body: bodyWithDurations }).unwrap();
      else await createWorkout(bodyWithDurations).unwrap();
      await fetchData();
      setViewMode('list');
      setEditingRecord(null);
      try { router.push('/workout'); } catch { }
      setToastVariant('success');
      setToastMsg('已儲存健身紀錄');
      setToastOpen(true);
    } catch (e) {
      console.error('儲存健身紀錄失敗', e);
      setToastVariant('error');
      setToastMsg('儲存失敗，請稍後再試');
      setToastOpen(true);
    }
  };

  // 由 URL 搜尋參數決定畫面模式，確保 Navbar 返回能回到列表
  useEffect(() => {
    const form = searchParams?.get('form');
    if (form === 'add') {
      setViewMode('add');
      setEditingRecord(null);
    } else if (form === 'edit') {
      setViewMode('edit');
    } else {
      setViewMode('list');
    }
  }, [searchParams]);

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
      <div className="container mx-auto py-4 px-4">
        {viewMode === 'list' && (
          <div className="max-w-5xl mx-auto">
            {/* 頁面大標題改由上方 Nav 顯示，這裡先隱藏 */}
            <div className="h-2" />

            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇日期</label>
                  <IOSDatePicker
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                    className="px-4 py-2 border border-[#E1E6EC] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent text-gray-900 w-full"
                  />
                </div>
                {listData?.dailyTotals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.totalVolume}</div>
                      <div className="text-xs text-gray-500 mt-1">總訓練量</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.totalSets}</div>
                      <div className="text-xs text-gray-500 mt-1">總組數</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.totalReps}</div>
                      <div className="text-xs text-gray-500 mt-1">次數</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.recordCount}</div>
                      <div className="text-xs text-gray-500 mt-1">筆數</div>
                    </Card>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-4">
              {(((listData?.records?.length ?? 0) === 0)) ? (
                <Card className="p-12 text-center">
                  <div className="text-gray-300 text-8xl mb-6">🏋️</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">今天還沒有健身紀錄</h3>
                  <p className="text-gray-600 mb-6">開始記錄你的訓練！</p>
                  <Button onClick={handleAdd} className="px-6 py-3 shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新增第一筆紀錄
                  </Button>
                </Card>
              ) : (
                (listData?.records ?? []).map((r: WorkoutRecord) => (
                  <Card key={r._id} className="overflow-hidden hover:shadow-[0_12px_28px_rgba(0,0,0,.06)] transition-shadow duration-200">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString('zh-TW')}</div>
                      <div className="space-x-2">
                        <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => requestDelete(r._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                        {typeof r.workoutDurationSeconds === 'number' && r.workoutDurationSeconds > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-purple-600">{Math.floor((r.workoutDurationSeconds || 0) / 60)} 分</div>
                            <div className="text-xs text-gray-600 mt-1">總時間</div>
                          </div>
                        )}
                        {typeof r.totalRestSeconds === 'number' && r.totalRestSeconds > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-rose-600">{Math.floor((r.totalRestSeconds || 0) / 60)} 分</div>
                            <div className="text-xs text-gray-600 mt-1">休息時間</div>
                          </div>
                        )}
                        {typeof r.workoutDurationSeconds === 'number' && r.workoutDurationSeconds > 0 && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-teal-600">{Math.max(0, Math.floor((r.workoutDurationSeconds - (r.totalRestSeconds || 0)) / 60))} 分</div>
                            <div className="text-xs text-gray-600 mt-1">運動時間</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="max-w-4xl mx-auto">
            {/* 返回由 Nav 提供，不再使用懸浮 BackBar */}
            <WorkoutForm
              draftKey={editingRecord ? `workout_draft_edit_${editingRecord._id}` : `workout_draft_add_${selectedDate}`}
              initialData={editingRecord ? { recordId: editingRecord._id, date: editingRecord.date.split('T')[0], exercises: editingRecord.exercises, notes: editingRecord.notes } : undefined}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      <ConfirmDialog
        open={confirmOpen}
        title="刪除確認"
        message="確定要刪除這筆健身紀錄嗎？此動作無法復原。"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function WorkoutForm({ draftKey, initialData, onCancel, onSubmit }: {
  draftKey: string;
  initialData?: { recordId?: string; date?: string; exercises?: WorkoutExercise[]; notes?: string };
  onCancel: () => void;
  onSubmit: (payload: { date: string; exercises: WorkoutExercise[]; notes?: string; workoutDurationSeconds?: number; totalRestSeconds?: number }) => void;
}) {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialData?.exercises || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const { data: bodyParts } = useGetBodyPartsQuery();
  const { data: commonExercises } = useGetCommonExercisesQuery(undefined); // 取得全部常用動作供雙欄輪盤使用
  const [dualOpen, setDualOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 手機偵測（小於等於 640px 視為手機）
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia('(max-width: 640px)');
      const set = () => setIsMobile(mq.matches);
      set();
      mq.addEventListener('change', set);
      return () => mq.removeEventListener('change', set);
    } catch {}
  }, []);

  // 自訂數字鍵盤控制
  const [numPadOpen, setNumPadOpen] = useState(false);
  const [numPadTitle, setNumPadTitle] = useState<string>('');
  const [numPadInitial, setNumPadInitial] = useState<number | string>('');
  const [numPadAllowDecimal, setNumPadAllowDecimal] = useState<boolean>(false);
  const [numPadTarget, setNumPadTarget] = useState<{ exIdx: number; setIdx: number; field: 'weight' | 'reps' } | null>(null);

  const openNumPad = useCallback((params: { exIdx: number; setIdx: number; field: 'weight' | 'reps'; title: string; initial: number | string; allowDecimal: boolean; }) => {
    setNumPadTarget({ exIdx: params.exIdx, setIdx: params.setIdx, field: params.field });
    setNumPadTitle(params.title);
    setNumPadInitial(params.initial);
    setNumPadAllowDecimal(params.allowDecimal);
    setNumPadOpen(true);
  }, []);

  // 專注模式與計時器狀態
  const [focusMode, setFocusMode] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restElapsed, setRestElapsed] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const [pendingRest, setPendingRest] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const weightStep = 2.5;
  const [focusPickerOpen, setFocusPickerOpen] = useState(false);
  const [focusPickerBodyPart, setFocusPickerBodyPart] = useState<string>('');
  const { data: focusCommonExercises } = useGetCommonExercisesQuery(focusPickerBodyPart || undefined);
  const [, setTimerOpen] = useState<boolean>(false);
  // 使用 react-timer-hook 取代手刻碼錶
  const trainWatch = useStopwatch({ autoStart: false });
  const restWatch = useStopwatch({ autoStart: false });
  const { setTotalSeconds: setGlobalSeconds, setRunning: setGlobalRunning } = useWorkoutTimer();

  const toastTimerRef = useRef<number | null>(null);
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1200) as unknown as number;
  }, []);

  // --- Draft (localStorage) ---
  // 載入草稿
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(draftKey) : null;
      if (!raw) return;
      const draft = JSON.parse(raw) as { date?: string; exercises?: WorkoutExercise[]; notes?: string; sessionMs?: number };
      if (draft.date) setDate(draft.date);
      if (draft.exercises) setExercises(draft.exercises);
      if (typeof draft.notes === 'string') setNotes(draft.notes);
      if (typeof draft.sessionMs === 'number' && draft.sessionMs > 0) {
        // 恢復主碼錶到草稿的經過時間
        try { trainWatch.reset(new Date(Date.now() - draft.sessionMs), false); } catch { }
      }
      showToast('已從草稿恢復');
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // 自動儲存草稿（debounce 1s）
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const payload = JSON.stringify({ date, exercises, notes, sessionMs: trainWatch.totalSeconds * 1000 });
        window.localStorage.setItem(draftKey, payload);
      } catch { }
    }, 1000) as unknown as number;
    return () => window.clearTimeout(id);
  }, [draftKey, date, exercises, notes, trainWatch.totalSeconds]);

  // 同步訓練碼錶到全域 Nav 顯示
  useEffect(() => {
    setGlobalSeconds(trainWatch.totalSeconds);
  }, [trainWatch.totalSeconds, setGlobalSeconds]);

  useEffect(() => {
    setGlobalRunning(trainWatch.isRunning);
  }, [trainWatch.isRunning, setGlobalRunning]);

  // 提醒離開頁面（有未儲存內容）
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (exercises.length > 0 || notes || trainWatch.totalSeconds > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [exercises.length, notes, trainWatch.totalSeconds]);

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    showToast('已移除動作');
  };

  // 動作名稱由常用清單帶入，前端不允許編輯

  const addSet = (exIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 8, completed: false }] } : ex));
    showToast('已新增一組');
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: ex.sets.filter((_, s) => s !== setIdx) } : ex));
    showToast('已刪除一組');
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'completed', value: number | boolean) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, sIdx) => sIdx === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const totalVolume = exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0);

  // 簡短時間列：總時間 / 運動 / 休息
  const shortStats = useMemo(() => {
    const totalSec = trainWatch.totalSeconds;
    const restSec = Math.max(0, exercises.reduce((acc, ex) => acc + ex.sets.reduce((a, set) => a + (set.restSeconds || 0), 0), 0) + (restElapsed ?? 0));
    const trainSec = Math.max(0, totalSec - restSec);
    const fmt = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    return { total: fmt(totalSec), rest: fmt(restSec), train: fmt(trainSec) };
  }, [trainWatch.totalSeconds, exercises, restElapsed]);

  // 移除本地 sessionMs 狀態，直接以 trainWatch 為準

  // 同步休息碼錶秒數到 restElapsed
  useEffect(() => {
    if (!restRunning) return;
    setRestElapsed(restWatch.totalSeconds);
  }, [restRunning, restWatch.totalSeconds]);



  const formatTime = useCallback((ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
  }, []);

  const formatSec = useCallback((sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const canAdvance = exercises.length > 0;

  const advanceToNextSet = useCallback(() => {
    setPendingRest(null);
    setRestRunning(false);
    setRestElapsed(null);
    setCurrentSetIndex((prevSetIdx) => {
      const ex = exercises[currentExerciseIndex];
      if (!ex) return 0;
      const isLastSet = prevSetIdx >= ex.sets.length - 1;
      if (!isLastSet) return prevSetIdx + 1;
      // 進入下一個動作
      setCurrentExerciseIndex((prevExIdx) => {
        const isLastExercise = prevExIdx >= exercises.length - 1;
        if (!isLastExercise) return prevExIdx + 1;
        // 所有完成
        showToast('恭喜完成所有訓練！');
        return prevExIdx;
      });
      return 0;
    });
  }, [currentExerciseIndex, exercises, showToast]);

  const startRestFor = useCallback((exIdx: number, setIdx: number) => {
    setPendingRest({ exIdx, setIdx });
    restWatch.reset(undefined, true);
    setRestElapsed(0);
    setRestRunning(true);
  }, [restWatch]);

  const finishRestAndAdvance = useCallback(() => {
    const spent = restWatch.totalSeconds || 0;
    if (pendingRest) {
      setExercises((prev) => prev.map((ex, i) => {
        if (i !== pendingRest.exIdx) return ex;
        const sets = ex.sets.map((s, sIdx) => sIdx === pendingRest.setIdx ? { ...s, restSeconds: spent } : s);
        return { ...ex, sets };
      }));
    }
    // 專注模式：直接新增下一組並將游標移到新組
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== (pendingRest?.exIdx ?? currentExerciseIndex)) return ex;
      const baseIdx = pendingRest?.setIdx ?? currentSetIndex;
      const last = ex.sets[baseIdx] || ex.sets[ex.sets.length - 1];
      const newSet = { weight: last?.weight ?? 0, reps: last?.reps ?? 8 };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
    restWatch.pause();
    restWatch.reset(undefined, false);
    setRestRunning(false);
    setRestElapsed(null);
    setPendingRest(null);
    setCurrentSetIndex(() => {
      const ex = exercises[(pendingRest?.exIdx ?? currentExerciseIndex)];
      const length = (ex?.sets?.length ?? 0) + 1;
      return Math.max(0, length - 1);
    });
  }, [currentExerciseIndex, currentSetIndex, exercises, pendingRest, restWatch, setExercises]);

  // 休息結束由使用者主動結束（累加計時，不自動前進）

  const completeCurrentSet = useCallback(() => {
    if (!canAdvance) return;
    startRestFor(currentExerciseIndex, currentSetIndex);
  }, [canAdvance, currentExerciseIndex, currentSetIndex, startRestFor]);

  const skipRestAndAdvance = useCallback(() => {
    // 記錄 0 秒休息，新增下一組並前進
    if (pendingRest) {
      setExercises((prev) => prev.map((ex, i) => {
        if (i !== pendingRest.exIdx) return ex;
        const setsWithRest = ex.sets.map((s, sIdx) => sIdx === pendingRest.setIdx ? { ...s, restSeconds: 0 } : s);
        const last = setsWithRest[pendingRest.setIdx] || setsWithRest[setsWithRest.length - 1];
        const newSet = { weight: last?.weight ?? 0, reps: last?.reps ?? 8 };
        return { ...ex, sets: [...setsWithRest, newSet] };
      }));
      setCurrentSetIndex(() => {
        const ex = exercises[pendingRest.exIdx];
        const length = (ex?.sets?.length ?? 0) + 1;
        return Math.max(0, length - 1);
      });
    } else {
      setExercises((prev) => prev.map((ex, i) => {
        if (i !== currentExerciseIndex) return ex;
        const last = ex.sets[currentSetIndex] || ex.sets[ex.sets.length - 1];
        const newSet = { weight: last?.weight ?? 0, reps: last?.reps ?? 8 };
        return { ...ex, sets: [...ex.sets, newSet] };
      }));
      setCurrentSetIndex(() => {
        const ex = exercises[currentExerciseIndex];
        const length = (ex?.sets?.length ?? 0) + 1;
        return Math.max(0, length - 1);
      });
    }
    setPendingRest(null);
    setRestRunning(false);
    setRestElapsed(null);
  }, [currentExerciseIndex, currentSetIndex, exercises, pendingRest, setExercises]);

  const currentExercise = useMemo(() => exercises[currentExerciseIndex], [exercises, currentExerciseIndex]);
  const currentSet = useMemo(() => currentExercise?.sets?.[currentSetIndex], [currentExercise, currentSetIndex]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {false && (
        <div className="fixed top-16 right-6 z-50 w-[min(92vw,360px)] bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">訓練時間</div>
            <button onClick={() => setTimerOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">總</span><span className="font-semibold tabular-nums">{shortStats.total}</span></div>
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">運</span><span className="text-teal-700 tabular-nums">{shortStats.train}</span></div>
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">休</span><span className="text-rose-700 tabular-nums">{shortStats.rest}</span></div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (trainWatch.isRunning) {
                  trainWatch.pause();
                } else {
                  trainWatch.start();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-white text-sm ${trainWatch.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {trainWatch.isRunning ? '暫停' : '開始'}
            </button>
            {restElapsed === null ? (
              <button type="button" onClick={() => { restWatch.reset(undefined, true); setRestElapsed(0); setRestRunning(true); }} className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm">開始休息</button>
            ) : (
              <button type="button" onClick={() => { restWatch.pause(); restWatch.reset(undefined, false); setRestRunning(false); setRestElapsed(null); }} className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm">結束休息</button>
            )}
            <button type="button" onClick={() => {
              trainWatch.reset(undefined, false);
              restWatch.pause();
              restWatch.reset(undefined, false);
              setRestElapsed(null);
              setRestRunning(false);
            }} className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">重置</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="block text-sm font-medium text-gray-700">記錄日期</label>
            <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </div>
            {!trainWatch.isRunning ? (
              <button
                type="button"
                onClick={() => {
                  console.log('開始訓練按鈕被點擊');
                  trainWatch.start();
                  setTimerOpen(true);
                  console.log('設置 sessionRunning = true');
                  setGlobalRunning(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm whitespace-nowrap"
              >
                開始訓練
              </button>
            ) : (
              <div className="text-xs text-gray-500 whitespace-nowrap">
                計時中 {formatSec(trainWatch.totalSeconds)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">動作名稱</label>
                  <input value={ex.exerciseName} readOnly placeholder="請由下方『新增動作』選擇常用項目" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900" />
                </div>
                <div className="w-14">
                  <label className="block text-sm font-medium text-transparent mb-2 select-none">刪除</label>
                  {exercises.length > 1 && (
                    <button type="button" onClick={() => removeExercise(idx)} className="inline-flex items-center justify-center h-12 w-14 rounded-md bg-red-500 hover:bg-red-600 text-white transition active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {ex.sets.map((s, sIdx) => (
                  <SwipeRow key={sIdx} onDelete={() => removeSet(idx, sIdx)} className="rounded-lg">
                    <div className="flex items-center gap-3 w-full p-2">
                      <button
                        type="button"
                        onClick={() => updateSet(idx, sIdx, 'completed', !s.completed)}
                        className={`h-8 w-8 shrink-0 rounded-md border-2 transition-colors flex items-center justify-center ${s.completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}
                        aria-label="標記完成"
                        title="標記完成"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 flex-1">
                        <label className="sr-only">重量 (kg)</label>
                        <input
                          type="number"
                          value={s.weight || ''}
                          readOnly={isMobile}
                          onClick={(e) => {
                            if (isMobile) {
                              e.preventDefault();
                              openNumPad({ exIdx: idx, setIdx: sIdx, field: 'weight', title: '輸入重量 (kg)', initial: s.weight || '', allowDecimal: true });
                            }
                          }}
                          onFocus={(e) => {
                            if (isMobile) {
                              e.target.blur();
                            }
                          }}
                          onChange={(e) => updateSet(idx, sIdx, 'weight', Number(e.target.value))}
                          className="h-10 w-24 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        />
                        <span className="text-gray-600">kg</span>

                        <label className="sr-only">次數</label>
                        <input
                          type="number"
                          min={1}
                          value={s.reps || ''}
                          readOnly={isMobile}
                          onClick={(e) => {
                            if (isMobile) {
                              e.preventDefault();
                              openNumPad({ exIdx: idx, setIdx: sIdx, field: 'reps', title: '輸入次數', initial: s.reps || '', allowDecimal: false });
                            }
                          }}
                          onFocus={(e) => {
                            if (isMobile) {
                              e.target.blur();
                            }
                          }}
                          onChange={(e) => updateSet(idx, sIdx, 'reps', Math.max(1, Number(e.target.value)))}
                          className="h-10 w-20 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        />
                        <span className="text-gray-600">次</span>
                      </div>
                    </div>
                  </SwipeRow>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => addSet(idx)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新增一組
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div id="exercise-bottom" />
          <button
              type="button"
              onClick={() => setDualOpen(true)}
              className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
            >
              + 動作
            </button>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (exercises.length === 0) {
                  // 允許直接新增
                }
                setFocusMode(true);
                // 專注模式改用自身碼錶，這裡暫停外部碼錶
                trainWatch.pause();
                setCurrentExerciseIndex((v) => (v < exercises.length ? v : 0));
                setCurrentSetIndex((s) => {
                  const ex = exercises[Math.min(currentExerciseIndex, exercises.length - 1)];
                  return ex && s < ex.sets.length ? s : 0;
                });
                showToast('已開啟專注模式');
              }}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
            >
              🎯 專注
            </button>
          </div>

          {/* 新的雙欄輪盤 */}
          <IOSDualWheelPicker
            open={dualOpen}
            title="新增動作"
            bodyParts={(bodyParts || [])}
            exercises={(commonExercises || []).map(e => ({ _id: e._id, name: e.name, bodyPart: e.bodyPart }))}
            onClose={() => setDualOpen(false)}
            onConfirm={(ex) => {
              setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
              setDualOpen(false);
              showToast(`已加入：${ex.name}`);
              try { document.getElementById('exercise-bottom')?.scrollIntoView({ behavior: 'smooth' }); } catch { }
            }}
          />
          {/* 舊 BottomSheet UI 已移除或保留為隱藏 */}
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
          <button
            onClick={() => {
              // 前端驗證：必須有 exerciseId，且 reps >= 1
              const invalid = exercises.some(ex => !ex.exerciseId || ex.sets.some(s => !s.reps || s.reps < 1));
              if (invalid) {
                alert('請從常用動作選擇項目，並確保每組次數至少為 1');
                return;
              }
              onSubmit({ date, exercises, notes, workoutDurationSeconds: trainWatch.totalSeconds });
              try { window.localStorage.removeItem(draftKey); } catch { }
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 active:scale-95"
          >
            {initialData ? '儲存變更' : '新增紀錄'}
          </button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}

      {/* 手機用自訂數字鍵盤 */}
      <IOSNumericKeypad
        open={numPadOpen}
        onClose={() => setNumPadOpen(false)}
        onConfirm={(val) => {
          if (!numPadTarget) return;
          const { exIdx, setIdx, field } = numPadTarget;
          const next = field === 'reps' ? Math.max(1, Math.floor(val || 0)) : val;
          updateSet(exIdx, setIdx, field, field === 'reps' ? next : Number(next));
          setNumPadOpen(false);
        }}
        title={numPadTitle}
        initialValue={numPadInitial}
        allowDecimal={numPadAllowDecimal}
      />

      {/* 專注模式疊層 */}
      <FocusMode
        open={focusMode}
        onClose={() => {
          setFocusMode(false);
          trainWatch.pause();
        }}
        exercises={exercises}
        setExercises={setExercises}
        bodyParts={bodyParts}
        onToast={showToast}
        onSessionMsChange={(ms) => { try { trainWatch.reset(new Date(Date.now() - ms), trainWatch.isRunning); } catch { } }}
        onTickMs={() => { }}
      />
      {false && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              onClick={() => {
                setFocusMode(false);
                trainWatch.pause();
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              關閉
            </button>
            <div className="text-sm opacity-80">訓練時間</div>
            <div className="text-lg font-semibold tabular-nums">{formatTime(trainWatch.totalSeconds * 1000)}</div>
          </div>

          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {currentExercise ? (
              <div className="max-w-xl mx-auto">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-widest text-gray-400">現在訓練</div>
                  <div className="text-2xl font-bold">{currentExercise.exerciseName}</div>
                  <div className="text-sm text-gray-300">第 {currentSetIndex + 1} 組 / 共 {currentExercise.sets.length} 組</div>
                </div>
                {/* 專注模式：快速切換/新增動作 */}
                <div className="mb-4">
                  <button
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
                    onClick={() => setFocusPickerOpen((v) => !v)}
                  >
                    切換/新增動作
                  </button>
                  {focusPickerOpen && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">選擇部位</label>
                          <select
                            value={focusPickerBodyPart}
                            onChange={(e) => setFocusPickerBodyPart(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white"
                          >
                            <option value="">全部</option>
                            {(bodyParts || []).map((bp) => (
                              <option key={bp} value={bp}>{bp}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">常用動作</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-auto pr-1">
                            {(focusCommonExercises || []).map((ex) => (
                              <button
                                key={ex._id}
                                onClick={() => {
                                  // 新增到清單並切換到該動作第一組
                                  setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
                                  setCurrentExerciseIndex(exercises.length);
                                  setCurrentSetIndex(0);
                                  setFocusPickerOpen(false);
                                  showToast(`已加入：${ex.name}`);
                                }}
                                className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-left text-sm"
                              >
                                {ex.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {currentSet && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">重量 (kg)</label>
                      <input
                        type="number"
                        value={currentSet.weight || ''}
                        onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'weight', Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                      />
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <button onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', Math.max(0, (currentSet.weight || 0) - weightStep))} className="py-2 rounded-lg bg-white/10 hover:bg-white/15">-{weightStep}</button>
                        <button onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', 0)} className="py-2 rounded-lg bg-white/10 hover:bg-white/15">重設</button>
                        <button onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', (currentSet.weight || 0) + weightStep)} className="py-2 rounded-lg bg-white/10 hover:bg-white/15">+{weightStep}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">次數</label>
                      <input
                        type="number"
                        min={1}
                        value={currentSet.reps || ''}
                        onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'reps', Math.max(1, Number(e.target.value)))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                      />
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <button onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'reps', Math.max(1, (currentSet.reps || 1) - 1))} className="py-2 rounded-lg bg-white/10 hover:bg-white/15">-1</button>
                        <div className="flex items-center justify-center text-sm opacity-80">快捷調整</div>
                        <button onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'reps', (currentSet.reps || 1) + 1)} className="py-2 rounded-lg bg-white/10 hover:bg-white/15">+1</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 休息區塊 */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">休息計時</div>
                      <div className="text-3xl font-bold tabular-nums">{formatSec(restElapsed)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-80">暫停/繼續控制見下方</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!pendingRest ? (
                      <>
                        <button
                          onClick={completeCurrentSet}
                          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                        >
                          完成這組
                        </button>
                        <button
                          onClick={() => startRestFor(currentExerciseIndex, currentSetIndex)}
                          className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                        >
                          只開始休息
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={finishRestAndAdvance}
                          className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                        >
                          結束休息 / 下一組（自動新增）
                        </button>
                        <button
                          onClick={() => setRestRunning((v) => !v)}
                          className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                        >
                          {restRunning ? '暫停休息' : '繼續休息'}
                        </button>
                        <button
                          onClick={skipRestAndAdvance}
                          className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                        >
                          略過
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-gray-300">結束休息由你決定，按下「結束休息 / 下一組」會自動新增一組並前進。</div>
                </div>

                {/* 底部控制列 */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { if (trainWatch.isRunning) trainWatch.pause(); else trainWatch.start(); }}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                  >
                    {trainWatch.isRunning ? '暫停訓練' : '繼續訓練'}
                  </button>
                  <div className="text-sm text-gray-300">當前第 {currentExerciseIndex + 1}/{exercises.length} 個動作</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // 上一組/上一動作
                        setPendingRest(null);
                        setRestRunning(false);
                        setRestElapsed(null);
                        setCurrentSetIndex((s) => {
                          if (s > 0) return s - 1;
                          // 回到上一個動作最後一組
                          setCurrentExerciseIndex((eIdx) => {
                            if (eIdx > 0) return eIdx - 1;
                            return eIdx;
                          });
                          const prevEx = exercises[Math.max(0, currentExerciseIndex - 1)];
                          return prevEx ? Math.max(0, prevEx.sets.length - 1) : 0;
                        });
                      }}
                      className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                    >上一組</button>
                    <button
                      onClick={() => {
                        setPendingRest(null);
                        setRestRunning(false);
                        setRestElapsed(null);
                        advanceToNextSet();
                      }}
                      className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15"
                    >下一組</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300">尚未選擇任何動作</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



