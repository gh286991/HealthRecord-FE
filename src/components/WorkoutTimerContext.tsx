'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type WorkoutTimerContextValue = {
  totalSeconds: number;
  isRunning: boolean;
  restSeconds: number;
  isRestRunning: boolean;
  setTotalSeconds: (sec: number) => void;
  setRunning: (running: boolean) => void;
  setRestSeconds: (sec: number) => void;
  setRestRunning: (running: boolean) => void;
  formatMMSS: (sec: number) => string;
};

const WorkoutTimerContext = createContext<WorkoutTimerContextValue | undefined>(undefined);

export function WorkoutTimerProvider({ children }: { children: React.ReactNode }) {
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [isRestRunning, setIsRestRunning] = useState<boolean>(false);

  const setRunning = useCallback((running: boolean) => setIsRunning(running), []);
  const setTotal = useCallback((sec: number) => setTotalSeconds(sec), []);
  const setRestRunning = useCallback((running: boolean) => setIsRestRunning(running), []);
  const setRest = useCallback((sec: number) => setRestSeconds(sec), []);

  const formatMMSS = useCallback((sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const value = useMemo<WorkoutTimerContextValue>(() => ({
    totalSeconds,
    isRunning,
    restSeconds,
    isRestRunning,
    setTotalSeconds: setTotal,
    setRunning,
    setRestSeconds: setRest,
    setRestRunning,
    formatMMSS,
  }), [totalSeconds, isRunning, restSeconds, isRestRunning, setTotal, setRunning, setRest, setRestRunning, formatMMSS]);

  return (
    <WorkoutTimerContext.Provider value={value}>{children}</WorkoutTimerContext.Provider>
  );
}

export function useWorkoutTimer() {
  const ctx = useContext(WorkoutTimerContext);
  if (!ctx) throw new Error('useWorkoutTimer 必須在 WorkoutTimerProvider 中使用');
  return ctx;
}


