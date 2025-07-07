import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UIState, Notification, UserProfile } from '@/types'

// 檢查本地存儲的 token 來初始化認證狀態
const getInitialAuthState = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return !!token
  }
  return false
}

const initialState: UIState = {
  sidebarOpen: false,
  activeModal: null,
  notifications: [],
  theme: 'light',
  isLoading: false,
  isAuthenticated: getInitialAuthState(),
  user: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ========== 側邊欄控制 ==========
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },

    // ========== 模態框控制 ==========
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },

    // ========== 通知系統 ==========
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)

      // 自動移除成功和資訊通知（5秒後）
      if (notification.type === 'success' || notification.type === 'info') {
        // 注意：這裡不直接使用 setTimeout，應該在組件中處理
        // 這只是標記需要自動移除的通知
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },

    // ========== 主題控制 ==========
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },

    // ========== 全局載入狀態 ==========
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // ========== 認證狀態管理 ==========
    login: (state, action: PayloadAction<{ token: string; user?: UserProfile }>) => {
      state.isAuthenticated = true
      state.user = action.payload.user || null
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  toggleTheme,
  setTheme,
  setGlobalLoading,
  login,
  logout,
  setUser,
} = uiSlice.actions

export default uiSlice.reducer

// ========== Selectors ==========
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectActiveModal = (state: { ui: UIState }) => state.ui.activeModal
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.isLoading
export const selectIsAuthenticated = (state: { ui: UIState }) => state.ui.isAuthenticated
export const selectUser = (state: { ui: UIState }) => state.ui.user 