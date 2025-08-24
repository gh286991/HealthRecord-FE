'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import IOSNumericKeypad from '@/components/ios/IOSNumericKeypad';
import { WorkoutExercise, useGetCommonExercisesQuery } from '@/lib/workoutApi';
import { useWorkoutTimer } from '@/components/WorkoutTimerContext';
import IOSDualWheelPicker from '@/components/ios/IOSDualWheelPicker';

interface FocusModeProps {
  open: boolean;
  onClose: () => void;
  exercises: WorkoutExercise[];
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>;
  bodyParts?: string[];
  onToast: (msg: string) => void;
  onSessionMsChange: (ms: number) => void;
  onTickMs?: (ms: number) => void;
}

export default function FocusMode({ open, onClose, exercises, setExercises, bodyParts, onToast, onSessionMsChange, onTickMs }: FocusModeProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [sessionMs, setSessionMs] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(true);
  const [restElapsed, setRestElapsed] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const [pendingRest, setPendingRest] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: focusCommonExercises } = useGetCommonExercisesQuery(undefined);
  const { setRunning: setGlobalRunning, setTotalSeconds: setGlobalSeconds } = useWorkoutTimer();

  useEffect(() => {
    if (!open) return;
    setSessionRunning(true);
    setGlobalRunning(true);
  }, [open, setGlobalRunning]);

  // 移除：不要每秒同步到父層，避免干擾外層碼錶

  // 訓練碼錶
  useEffect(() => {
    if (!sessionRunning || !open) return;
    const id = window.setInterval(() => setSessionMs((ms) => ms + 1000), 1000) as unknown as number;
    return () => window.clearInterval(id);
  }, [sessionRunning, open]);

  // 將目前毫秒回傳給父層做顯示（不影響父層碼錶）
  useEffect(() => {
    if (!open) return;
    if (onTickMs) onTickMs(sessionMs);
    setGlobalSeconds(Math.floor(sessionMs / 1000));
  }, [sessionMs, open, onTickMs, setGlobalSeconds]);

  // 休息累加
  useEffect(() => {
    if (!restRunning || restElapsed === null || !open) return;
    const id = window.setInterval(() => setRestElapsed((sec) => (sec === null ? sec : sec + 1)), 1000) as unknown as number;
    return () => window.clearInterval(id);
  }, [restRunning, restElapsed, open]);

  const currentExercise = useMemo(() => exercises[currentExerciseIndex], [exercises, currentExerciseIndex]);
  const currentSet = useMemo(() => currentExercise?.sets?.[currentSetIndex], [currentExercise, currentSetIndex]);

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

  // 圓形碼錶（每分鐘進度環）
  const secondInMinute = useMemo(() => Math.floor((sessionMs / 1000) % 60), [sessionMs]);
  const progress = useMemo(() => secondInMinute / 60, [secondInMinute]);
  const ringColor = restElapsed !== null ? '#ef4444' : (sessionRunning ? '#10b981' : '#f59e0b');

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, sI) => sI === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  // 手機偵測
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
  
  // 使用 isMobile 變數來避免未使用警告
  const isMobileDevice = isMobile;
  console.log('Mobile device:', isMobileDevice); // 暫時使用來避免警告

  // 自訂數字鍵盤
  const [numPadOpen, setNumPadOpen] = useState(false);
  const [numPadTitle, setNumPadTitle] = useState<string>('');
  const [numPadInitial, setNumPadInitial] = useState<number | string>('');
  const [numPadAllowDecimal, setNumPadAllowDecimal] = useState<boolean>(false);
  const [numPadTarget, setNumPadTarget] = useState<{ exIdx: number; setIdx: number; field: 'weight' | 'reps' } | null>(null);
  const openNumPad = (params: { exIdx: number; setIdx: number; field: 'weight' | 'reps'; title: string; initial: number | string; allowDecimal: boolean; }) => {
    setNumPadTarget({ exIdx: params.exIdx, setIdx: params.setIdx, field: params.field });
    setNumPadTitle(params.title);
    setNumPadInitial(params.initial);
    setNumPadAllowDecimal(params.allowDecimal);
    setNumPadOpen(true);
  };

  const startRestFor = useCallback((exIdx: number, setIdx: number) => {
    setPendingRest({ exIdx, setIdx });
    setRestElapsed(0);
    setRestRunning(true);
  }, []);

  const finishRestAndAdvance = useCallback(() => {
    const spent = restElapsed === null ? 0 : restElapsed;
    if (pendingRest) {
      setExercises((prev) => prev.map((ex, i) => {
        if (i !== pendingRest.exIdx) return ex;
        const sets = ex.sets.map((s, sIdx) => sIdx === pendingRest.setIdx ? { ...s, restSeconds: spent } : s);
        // 新增下一組（複製上一組）
        const base = sets[pendingRest.setIdx] || sets[sets.length - 1];
        const next = { weight: base?.weight ?? 0, reps: base?.reps ?? 8 };
        return { ...ex, sets: [...sets, next] };
      }));
      setCurrentSetIndex(() => {
        const ex = exercises[pendingRest.exIdx];
        const length = (ex?.sets?.length ?? 0) + 1;
        return Math.max(0, length - 1);
      });
    }
    setPendingRest(null);
    setRestRunning(false);
    setRestElapsed(null);
  }, [exercises, pendingRest, restElapsed, setExercises]);

  const skipRestAndAdvance = useCallback(() => {
    if (pendingRest) {
      setExercises((prev) => prev.map((ex, i) => {
        if (i !== pendingRest.exIdx) return ex;
        const setsWithRest = ex.sets.map((s, sIdx) => sIdx === pendingRest.setIdx ? { ...s, restSeconds: 0 } : s);
        const base = setsWithRest[pendingRest.setIdx] || setsWithRest[setsWithRest.length - 1];
        const next = { weight: base?.weight ?? 0, reps: base?.reps ?? 8 };
        return { ...ex, sets: [...setsWithRest, next] };
      }));
      setCurrentSetIndex(() => {
        const ex = exercises[pendingRest.exIdx];
        const length = (ex?.sets?.length ?? 0) + 1;
        return Math.max(0, length - 1);
      });
    }
    setPendingRest(null);
    setRestRunning(false);
    setRestElapsed(null);
  }, [exercises, pendingRest, setExercises]);



  if (!open) return null;

  const weightStep = 2.5;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => { onSessionMsChange(sessionMs); onClose(); setSessionRunning(false); setGlobalRunning(false); }}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          關閉
        </button>
        <div className="text-sm opacity-80">訓練時間</div>
        <div className="text-lg font-semibold tabular-nums">{formatTime(sessionMs)}</div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        {exercises.length > 0 ? (
          <div className="max-w-lg mx-auto w-full text-center space-y-8">
            {/* 極簡圓形計時器 - 居中 */}
            <div className="flex justify-center items-center">
              <div className="relative" style={{ width: 220, height: 220 }}>
                <svg width={220} height={220} viewBox="0 0 220 220" className="transform -rotate-90">
                  <circle cx="110" cy="110" r="100" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle
                    cx="110"
                    cy="110"
                    r="100"
                    stroke={ringColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 100} ${2 * Math.PI * 100}`}
                    strokeDashoffset={2 * Math.PI * 100 * (1 - progress)}
                    fill="none"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400 mb-2 font-light tracking-wider">
                    {restElapsed !== null ? '休息中' : '專注'}
                  </div>
                  <div className="text-5xl font-light tabular-nums text-white mb-2">
                    {restElapsed !== null ? formatSec(restElapsed) : formatTime(sessionMs)}
                  </div>
                  {currentExercise ? (
                    <>
                      <div className="text-sm text-gray-300 font-light">
                        {currentExercise.exerciseName}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        第 {currentSetIndex + 1} / {currentExercise.sets.length} 組
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-300 font-light">
                      準備中...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 極簡操作區 */}
            <div className="space-y-6">
              {/* 主要動作 */}
              {currentExercise ? (
                restElapsed === null ? (
                  <button
                    onClick={() => startRestFor(currentExerciseIndex, currentSetIndex)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    完成這組
                  </button>
                ) : (
                  <button
                    onClick={finishRestAndAdvance}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    繼續下一組
                  </button>
                )
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  先選擇動作開始訓練
                </div>
              )}

              {/* 次要操作 */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSessionRunning((v) => !v)}
                  className="px-6 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-all"
                >
                  {sessionRunning ? '暫停' : '繼續'}
                </button>
                {restElapsed !== null && (
                  <button
                    onClick={skipRestAndAdvance}
                    className="px-6 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-all"
                  >
                    跳過休息
                  </button>
                )}
              </div>

              {/* 重量次數調整 - 極簡版 */}
              {currentExercise && currentSet && (
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">重量</div>
                      <div
                        className="text-2xl font-light text-white mb-3"
                        onClick={() => openNumPad({ exIdx: currentExerciseIndex, setIdx: currentSetIndex, field: 'weight', title: '輸入重量 (kg)', initial: currentSet.weight || '', allowDecimal: true })}
                      >
                        {currentSet.weight} kg
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', Math.max(0, (currentSet.weight || 0) - weightStep))}
                          className="flex-1 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'weight', (currentSet.weight || 0) + weightStep)}
                          className="flex-1 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">次數</div>
                      <div
                        className="text-2xl font-light text-white mb-3"
                        onClick={() => openNumPad({ exIdx: currentExerciseIndex, setIdx: currentSetIndex, field: 'reps', title: '輸入次數', initial: currentSet.reps || '', allowDecimal: false })}
                      >
                        {currentSet.reps}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'reps', Math.max(1, (currentSet.reps || 1) - 1))}
                          className="flex-1 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => updateSet(currentExerciseIndex, currentSetIndex, 'reps', (currentSet.reps || 1) + 1)}
                          className="flex-1 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 動作選擇 - 和外面訓練頁面一樣的設計 */}
            <div>
              <button 
                type="button" 
                onClick={() => setPickerOpen(true)} 
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                + 新增/切換動作
              </button>
              <IOSDualWheelPicker
                open={pickerOpen}
                title="新增動作"
                bodyParts={(bodyParts || [])}
                exercises={(focusCommonExercises || []).map(e => ({ _id: e._id, name: e.name, bodyPart: e.bodyPart }))}
                onClose={() => setPickerOpen(false)}
                onConfirm={(ex) => {
                  setExercises((prev) => [...prev, { exerciseName: ex.name, bodyPart: ex.bodyPart, exerciseId: ex._id, sets: [{ weight: 0, reps: 8 }] }]);
                  setPickerOpen(false);
                  setCurrentExerciseIndex(exercises.length);
                  setCurrentSetIndex(0);
                  onToast(`已加入：${ex.name}`);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center space-y-8">
            <div className="text-center space-y-4">
              <div className="text-2xl font-light text-gray-300">準備開始訓練</div>
              <div className="text-sm text-gray-400">可以先開始計時，存檔前再選擇動作</div>
            </div>
            
            {/* 開始訓練按鈕 */}
            <div className="space-y-4 w-full max-w-sm">
              <button
                onClick={() => {
                  // 不需要動作也可以開始計時
                  setSessionRunning(true);
                  onToast('開始訓練計時');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                開始訓練計時
              </button>
              
              <button 
                type="button" 
                onClick={() => setPickerOpen(true)} 
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                + 選擇動作
              </button>
            </div>
            
            
          </div>
        )}
      </div>
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
    </div>
  );
}


