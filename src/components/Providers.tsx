"use client";

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { WorkoutTimerProvider } from '@/components/WorkoutTimerContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WorkoutTimerProvider>
        {children}
      </WorkoutTimerProvider>
    </Provider>
  );
}


