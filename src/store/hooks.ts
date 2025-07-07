import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// 使用這些 typed hooks 而不是普通的 useDispatch 和 useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// 便利的 selector hooks
export const useNotifications = () => useAppSelector((state) => state.ui.notifications)
export const useTheme = () => useAppSelector((state) => state.ui.theme)
export const useSidebarOpen = () => useAppSelector((state) => state.ui.sidebarOpen)
export const useActiveModal = () => useAppSelector((state) => state.ui.activeModal)
export const useGlobalLoading = () => useAppSelector((state) => state.ui.isLoading)
export const useIsAuthenticated = () => useAppSelector((state) => state.ui.isAuthenticated)
export const useUser = () => useAppSelector((state) => state.ui.user) 