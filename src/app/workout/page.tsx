'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import IOSDatePicker from '@/components/ios/IOSDatePicker';
import IOSDualWheelPicker from '@/components/ios/IOSDualWheelPicker';
import IOSNumericKeypad from '@/components/ios/IOSNumericKeypad';
import { tokenUtils } from '@/lib/api';
import { WorkoutRecord, WorkoutExercise, useCreateWorkoutMutation, useGetWorkoutListQuery, useUpdateWorkoutMutation, useGetBodyPartsQuery, useGetCommonExercisesQuery, useDeleteWorkoutMutation } from '@/lib/workoutApi';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Toast from '@/components/Toast';
import SwipeRow from '@/components/SwipeRow';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useWorkoutTimer } from '@/components/WorkoutTimerContext';
import IOSAlertModal from '@/components/ios/IOSAlertModal';
import WorkoutSummaryModal from '@/components/workout/WorkoutSummaryModal';
import QuickAddExercise from '@/components/workout/QuickAddExercise';

type ViewMode = 'list' | 'add' | 'edit';

// 輔助函數：只有在有翻譯鍵值時才使用翻譯，否則使用原始名稱
const createTranslateExerciseName = (t: (key: string) => string) => (key: string, fallback: string) => {
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

function WorkoutPageContent() {
  const t = useTranslations();
  const getTranslatedName = createTranslateExerciseName(t);
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
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<null | {
    date: string;
    exercises: Array<{ name: string; sets: number; reps: number; volume: number }>;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    workoutDurationSeconds?: number;
    totalRestSeconds?: number;
  }>(null);

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
      console.error('Failed to fetch workout records', e);
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
      setToastMsg(t('workout.recordDeleted'));
      setToastOpen(true);
    } catch (e) {
      console.error('Failed to delete record', e);
      setToastVariant('error');
      setToastMsg(t('workout.deleteFailed'));
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
      if (editingRecord) {
        await updateWorkout({ id: editingRecord._id, body: bodyWithDurations }).unwrap();
        await fetchData();
        setViewMode('list');
        setEditingRecord(null);
        try { router.push('/workout'); } catch { }
        setToastVariant('success');
        setToastMsg(t('workout.recordSaved'));
        setToastOpen(true);
      } else {
        await createWorkout(bodyWithDurations).unwrap();
        await fetchData();
        const perExercise = (payload.exercises || []).map(ex => {
          const sets = ex.sets?.length || 0;
          const reps = (ex.sets || []).reduce((s, set) => s + (set.reps || 0), 0);
          const volume = (ex.sets || []).reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
          return { name: ex.exerciseName, sets, reps, volume };
        });
        const totals = perExercise.reduce((t, e) => ({
          totalVolume: t.totalVolume + e.volume,
          totalSets: t.totalSets + e.sets,
          totalReps: t.totalReps + e.reps,
        }), { totalVolume: 0, totalSets: 0, totalReps: 0 });
        setSummaryData({
          date: payload.date || new Date().toISOString(),
          exercises: perExercise,
          totalVolume: totals.totalVolume,
          totalSets: totals.totalSets,
          totalReps: totals.totalReps,
          workoutDurationSeconds: payload.workoutDurationSeconds,
          totalRestSeconds: ensuredTotalRestSeconds,
        });
        setSummaryOpen(true);
        setToastVariant('success');
        setToastMsg(t('workout.recordSaved'));
        setToastOpen(true);
      }
    } catch (e) {
      console.error('Failed to save workout record', e);
      setToastVariant('error');
      setToastMsg(t('workout.saveFailed'));
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
          <p className="text-gray-600">{t('workout.verifyingLogin')}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.selectDate')}</label>
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
                      <div className="text-xs text-gray-500 mt-1">{t('workout.totalVolume')}</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.totalSets}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('workout.totalSets')}</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.totalReps}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('workout.totalReps')}</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-semibold text-gray-900">{listData.dailyTotals.recordCount}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('workout.recordCount')}</div>
                    </Card>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-4">
              {(((listData?.records?.length ?? 0) === 0)) ? (
                <Card className="p-12 text-center">
                  <div className="text-gray-300 text-8xl mb-6">🏋️</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{t('workout.noRecordsToday')}</h3>
                  <p className="text-gray-600 mb-6">{t('workout.startRecording')}</p>
                  <Button onClick={handleAdd} className="px-6 py-3 shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('workout.addFirstRecord')}
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
                          <div className="font-semibold text-gray-900 mb-2">{getTranslatedName(`exercise.${ex.exerciseName}`, ex.exerciseName)}</div>
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
                          <div className="text-xs text-gray-600 mt-1">{t('workout.totalVolume')}</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-blue-600">{r.totalSets}</div>
                          <div className="text-xs text-gray-600 mt-1">組數</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-orange-600">{r.totalReps}</div>
                          <div className="text-xs text-gray-600 mt-1">{t('workout.totalReps')}</div>
                        </div>
                        {typeof r.workoutDurationSeconds === 'number' && r.workoutDurationSeconds > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-purple-600">{Math.floor((r.workoutDurationSeconds || 0) / 60)} 分</div>
                            <div className="text-xs text-gray-600 mt-1">{t('workout.totalTime')}</div>
                          </div>
                        )}
                        {typeof r.totalRestSeconds === 'number' && r.totalRestSeconds > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-rose-600">{Math.floor((r.totalRestSeconds || 0) / 60)} 分</div>
                            <div className="text-xs text-gray-600 mt-1">{t('workout.restTime')}</div>
                          </div>
                        )}
                        {typeof r.workoutDurationSeconds === 'number' && r.workoutDurationSeconds > 0 && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center col-span-3 sm:col-span-1">
                            <div className="text-xl font-bold text-teal-600">{Math.max(0, Math.floor((r.workoutDurationSeconds - (r.totalRestSeconds || 0)) / 60))} 分</div>
                            <div className="text-xs text-gray-600 mt-1">{t('workout.workoutTime')}</div>
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
        title={t('workout.deleteConfirm')}
        message={t('workout.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
      <WorkoutSummaryModal
        open={summaryOpen}
        data={summaryData}
        encouragement={summaryOpen ? pickEncouragement() : undefined}
        onClose={() => {
          setSummaryOpen(false);
          setViewMode('list');
          setEditingRecord(null);
          try { router.push('/workout'); } catch { }
        }}
      />
    </div>
  );
}

function pickEncouragement() {
  const items = [
    '太強了！持續累積就是勝利 💪',
    '今天也有努力，身體會記得的 👏',
    '穩穩推進，每一步都算數 🚀',
    '好節奏！記得補充水分與睡眠 💤',
  ];
  try {
    return items[Math.floor(Math.random() * items.length)];
  } catch {
    return items[0];
  }
}

function WorkoutForm({ draftKey, initialData, onCancel, onSubmit }: {
  draftKey: string;
  initialData?: { recordId?: string; date?: string; exercises?: WorkoutExercise[]; notes?: string };
  onCancel: () => void;
  onSubmit: (payload: { date: string; exercises: WorkoutExercise[]; notes?: string; workoutDurationSeconds?: number; totalRestSeconds?: number }) => void;
}) {
  const t = useTranslations();
  const getTranslatedName = createTranslateExerciseName(t);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialData?.exercises || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const { data: bodyParts } = useGetBodyPartsQuery();
  const { data: commonExercises } = useGetCommonExercisesQuery(undefined); // 取得全部常用動作供雙欄輪盤使用
  const [dualOpen, setDualOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
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

  // 使用 react-timer-hook 取代手刻碼錶
  const trainWatch = useStopwatch({ autoStart: false });
  const restWatch = useStopwatch({ autoStart: false });
  const { setTotalSeconds: setGlobalSeconds, setRunning: setGlobalRunning, setRestSeconds: setGlobalRestSeconds, setRestRunning: setGlobalRestRunning } = useWorkoutTimer();

  // 新增：每組訓練/休息狀態管理
  const [currentRun, setCurrentRun] = useState<{ exIdx: number; setIdx: number; startMs: number } | null>(null);
  const [lastCompleted, setLastCompleted] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const [lastRestStartMs, setLastRestStartMs] = useState<number | null>(null);
  const [workSecondsMap, setWorkSecondsMap] = useState<Record<string, number>>({});
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [startConfirmOpen, setStartConfirmOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<{ exIdx: number; setIdx: number } | null>(null);

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
      showToast(t('workout.restoredFromDraft'));
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

  // 同步休息碼錶到全域 Nav 顯示
  useEffect(() => {
    setGlobalRestSeconds(restWatch.totalSeconds);
  }, [restWatch.totalSeconds, setGlobalRestSeconds]);

  useEffect(() => {
    setGlobalRestRunning(restWatch.isRunning);
  }, [restWatch.isRunning, setGlobalRestRunning]);

  // 監聽來自導覽列的計時器控制事件
  useEffect(() => {
    const handleToggleTraining = () => {
      if (!trainWatch.isRunning) {
        trainWatch.start();
        setGlobalRunning(true);
      } else {
        trainWatch.pause();
        setGlobalRunning(false);
      }
    };

    const handleToggleRest = () => {
      if (!restWatch.isRunning) {
        restWatch.reset(undefined, true);
      } else {
        restWatch.pause();
      }
    };

    window.addEventListener('toggleTrainingTimer', handleToggleTraining);
    window.addEventListener('toggleRestTimer', handleToggleRest);

    return () => {
      window.removeEventListener('toggleTrainingTimer', handleToggleTraining);
      window.removeEventListener('toggleRestTimer', handleToggleRest);
    };
  }, [trainWatch, restWatch, setGlobalRunning]);

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
    showToast(t('workout.exerciseRemoved'));
  };

  // 動作名稱由常用清單帶入，前端不允許編輯

  const addSet = (exIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 8, completed: false }] } : ex));
    showToast(t('workout.setAdded'));
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => prev.map((ex, i) => i === exIdx ? { ...ex, sets: ex.sets.filter((_, s) => s !== setIdx) } : ex));
    showToast(t('workout.setDeleted'));
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps' | 'completed' | 'restSeconds', value: number | boolean) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, sIdx) => sIdx === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const totalVolume = exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0);

  const formatSec = useCallback((sec: number | null) => {
    if (sec === null || sec === 0) return '--:--';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const startSet = useCallback((exIdx: number, setIdx: number) => {
    // 結束上一段休息並寫入上一個完成組的 restSeconds
    if (lastRestStartMs && lastCompleted) {
      const restSec = Math.floor((Date.now() - lastRestStartMs) / 1000);
      updateSet(lastCompleted.exIdx, lastCompleted.setIdx, 'restSeconds', restSec);
      setLastRestStartMs(null);
      restWatch.pause();
      setGlobalRestRunning(false);
    }
    // 開始本組訓練
    setCurrentRun({ exIdx, setIdx, startMs: Date.now() });
    trainWatch.start();
    setGlobalRunning(true);
  }, [lastRestStartMs, lastCompleted, restWatch, setGlobalRestRunning, trainWatch, setGlobalRunning]);

  const toggleComplete = useCallback((exIdx: number, setIdx: number) => {
    const already = !!exercises[exIdx]?.sets[setIdx]?.completed;
    const nextVal = !already;
    updateSet(exIdx, setIdx, 'completed', nextVal);

    const key = `${exIdx}-${setIdx}`;

    if (nextVal) {
      // 完成當前組：若正在訓練，記錄該組運動時間，並開始休息
      if (currentRun && currentRun.exIdx === exIdx && currentRun.setIdx === setIdx) {
        const workSec = Math.floor((Date.now() - currentRun.startMs) / 1000);
        setWorkSecondsMap((m) => ({ ...m, [key]: workSec }));
        setCurrentRun(null);
      }
      // 開始休息
      trainWatch.pause();
      setGlobalRunning(false);
      setLastCompleted({ exIdx, setIdx });
      setLastRestStartMs(Date.now());
      restWatch.reset(undefined, true);
      setGlobalRestRunning(true);
    } else {
      // 取消完成：清掉暫存運動時間
      setWorkSecondsMap((m) => {
        const clone = { ...m };
        delete clone[key];
        return clone;
      });
    }
  }, [exercises, currentRun, trainWatch, setGlobalRunning, restWatch, setGlobalRestRunning]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">

      <div className="space-y-6">
        
        {/* 記錄日期 */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="block text-sm font-medium text-gray-700">{t('workout.recordDate')}</label>
            <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.exerciseName')}</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[42px] flex items-center">
                    {ex.exerciseName ? getTranslatedName(`exercise.${ex.exerciseName}`, ex.exerciseName) : (
                      <span className="text-gray-400">{t('workout.selectFromCommon')}</span>
                    )}
                  </div>
                </div>
                <div className="w-14">
                  <label className="block text-sm font-medium text-transparent mb-2 select-none">{t('common.delete')}</label>
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
                        onClick={() => toggleComplete(idx, sIdx)}
                        disabled={!!currentRun && !(currentRun.exIdx === idx && currentRun.setIdx === sIdx)}
                        aria-disabled={!!currentRun && !(currentRun.exIdx === idx && currentRun.setIdx === sIdx)}
                        className={`h-8 w-8 shrink-0 rounded-md border-2 transition-colors flex items-center justify-center
                          ${s.completed ? 'bg-emerald-500 border-emerald-600 text-white' :
                            (currentRun && currentRun.exIdx === idx && currentRun.setIdx === sIdx)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-2 ring-emerald-200'
                              : 'bg-white border-gray-300 text-gray-400'}
                          ${!!currentRun && !(currentRun.exIdx === idx && currentRun.setIdx === sIdx) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="標記完成"
                        title="標記完成"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 flex-1">
                        <label className="sr-only">{t('workout.weight')} ({t('workout.kg')})</label>
                        <input
                          type="number"
                          value={s.weight || ''}
                          readOnly={isMobile}
                          onClick={(e) => {
                            if (isMobile) {
                              e.preventDefault();
                              openNumPad({ exIdx: idx, setIdx: sIdx, field: 'weight', title: t('workout.enterWeight'), initial: s.weight || '', allowDecimal: true });
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
                        <span className="text-gray-600">{t('workout.kg')}</span>

                        <label className="sr-only">{t('workout.reps')}</label>
                        <input
                          type="number"
                          min={1}
                          value={s.reps || ''}
                          readOnly={isMobile}
                          onClick={(e) => {
                            if (isMobile) {
                              e.preventDefault();
                              openNumPad({ exIdx: idx, setIdx: sIdx, field: 'reps', title: t('workout.enterReps'), initial: s.reps || '', allowDecimal: false });
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
                        <span className="text-gray-600">{t('workout.times')}</span>
                      </div>

                      {/* 組間/本組控制 */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingStart({ exIdx: idx, setIdx: sIdx });
                            setStartConfirmOpen(true);
                          }}
                          className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('workout.start')}
                          disabled={!!currentRun || !!s.completed}
                        >
                          {t('workout.start')}
                        </button>
                        {workSecondsMap[`${idx}-${sIdx}`] !== undefined && workSecondsMap[`${idx}-${sIdx}`] > 0 && (
                          <span className="text-xs text-gray-500">{t('workout.thisSetWorkout')} {formatSec(workSecondsMap[`${idx}-${sIdx}`])}</span>
                        )}
                      </div>
                      {/* 休息時間會在完成到下一次開始之間自動累計，不提供手動按鈕 */}
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
                    {t('workout.addSet')}
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
              {t('workout.addExerciseAction')}
            </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              {t('workout.addCustomExercise')}
            </button>
          </div>
          <IOSDualWheelPicker
            open={dualOpen}
            title={t('workout.addExercise')}
            bodyParts={(bodyParts || [])}
            exercises={(commonExercises || []).map(e => ({ _id: e._id, name: e.name, bodyPart: e.bodyPart }))}
            onClose={() => setDualOpen(false)}
            onConfirm={(ex) => {
              setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
              setDualOpen(false);
              showToast(`${t('workout.exerciseAdded')}：${ex.name}`);
              try { document.getElementById('exercise-bottom')?.scrollIntoView({ behavior: 'smooth' }); } catch { }
            }}
          />
          <QuickAddExercise
            open={quickOpen}
            onClose={() => setQuickOpen(false)}
            onAdded={(ex) => {
              setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
              setQuickOpen(false);
              showToast(`${t('workout.customExerciseAdded')}：${ex.name}`);
              try { document.getElementById('exercise-bottom')?.scrollIntoView({ behavior: 'smooth' }); } catch { }
            }}
          />
          {/* 舊 BottomSheet UI 已移除或保留為隱藏 */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" placeholder={t('workout.notesPlaceholder')} />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mt-4">
          <div className="text-sm text-gray-700">{t('workout.currentTotalVolume')}：<span className="font-semibold text-green-700">{totalVolume}</span></div>
        </div>

        <div className="flex gap-4 pt-6">
          <button onClick={onCancel} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors active:scale-95">{t('common.cancel')}</button>
          <button
            onClick={() => {
              const invalid = exercises.some(ex => !ex.exerciseId || ex.sets.some(s => !s.reps || s.reps < 1));
              if (invalid) {
                alert(t('workout.selectFromCommon'));
                return;
              }
              const hasStarted = !!trainWatch.totalSeconds || !!currentRun || Object.keys(workSecondsMap).length > 0;
              if (!initialData && hasStarted) {
                setFinishConfirmOpen(true);
                return;
              }
              onSubmit({ date, exercises, notes, workoutDurationSeconds: trainWatch.totalSeconds });
              try { window.localStorage.removeItem(draftKey); } catch { }
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 active:scale-95"
          >
            {initialData ? t('workout.saveChanges') : (!!trainWatch.totalSeconds || !!currentRun || Object.keys(workSecondsMap).length > 0 ? t('workout.finishWorkout') : t('workout.addRecord'))}
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
      {/* 完成確認 iOS 風格 */}
      <IOSAlertModal
        open={finishConfirmOpen}
        title={t('workout.completeWorkout')}
        message={t('workout.completeWorkoutMessage')}
        cancelText={t('workout.doubleCheck')}
        confirmText={t('workout.completeAndSubmit')}
        onCancel={() => setFinishConfirmOpen(false)}
        onConfirm={() => {
          setFinishConfirmOpen(false);
          try { trainWatch.pause(); } catch {}
          try {
            let totalRest = (exercises || []).reduce((acc, ex) => acc + (ex.sets || []).reduce((s, set) => s + (set.restSeconds || 0), 0), 0);
            if (lastRestStartMs && lastCompleted) {
              const extra = Math.max(0, Math.floor((Date.now() - lastRestStartMs) / 1000));
              totalRest += extra;
            }
            onSubmit({ date, exercises, notes, workoutDurationSeconds: trainWatch.totalSeconds, totalRestSeconds: totalRest });
          } catch {}
          try { window.localStorage.removeItem(draftKey); } catch { }
        }}
      />

      {/* 開始訓練確認 iOS 風格 */}
      <IOSAlertModal
        open={startConfirmOpen}
        title={t('workout.startTraining')}
        message={t('workout.startTrainingMessage')}
        cancelText={t('workout.notYet')}
        confirmText={t('workout.start')}
        onCancel={() => {
          setStartConfirmOpen(false);
          setPendingStart(null);
        }}
        onConfirm={() => {
          setStartConfirmOpen(false);
          if (pendingStart) {
            startSet(pendingStart.exIdx, pendingStart.setIdx);
            setPendingStart(null);
          }
        }}
      />

    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <WorkoutPageContent />
    </Suspense>
  );
}



