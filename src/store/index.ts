import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { healthApi } from './api/healthApi'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [healthApi.reducerPath]: healthApi.reducer,
    // UI 狀態 slice
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略這些 action types 的序列化檢查
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          // RTK Query 的內部 actions
          'api/executeQuery/pending',
          'api/executeQuery/fulfilled',
          'api/executeQuery/rejected',
          'api/executeMutation/pending',
          'api/executeMutation/fulfilled',
          'api/executeMutation/rejected',
        ],
        // 忽略這些 action paths 的序列化檢查
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // 忽略這些 state paths 的序列化檢查
        ignoredPaths: ['items.dates'],
      },
    }).concat(healthApi.middleware),
  // 開發環境啟用 Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
})

// 設置 RTK Query 監聽器（用於 refetchOnFocus/refetchOnReconnect）
setupListeners(store.dispatch)

// 導出類型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

// Next.js 已內建熱重載功能，無需額外配置 