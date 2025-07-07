'use client'

import { useEffect } from 'react'
import { useNotifications, useAppDispatch } from '@/store/hooks'
import { removeNotification } from '@/store/slices/uiSlice'

export default function NotificationSystem() {
  const notifications = useNotifications()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // 自動移除成功和資訊通知（5秒後）
    notifications.forEach((notification) => {
      if (notification.type === 'success' || notification.type === 'info') {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id))
        }, 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, dispatch])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center justify-between
            min-w-80 max-w-sm p-4 rounded-lg shadow-lg
            transition-all duration-300 ease-in-out
            ${getNotificationStyles(notification.type)}
          `}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <span className="sr-only">關閉</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

function getNotificationStyles(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 border border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border border-red-200 text-red-800'
    case 'warning':
      return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
    case 'info':
      return 'bg-blue-50 border border-blue-200 text-blue-800'
    default:
      return 'bg-gray-50 border border-gray-200 text-gray-800'
  }
}

function getNotificationIcon(type: string): React.ReactElement {
  switch (type) {
    case 'success':
      return (
        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'error':
      return (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    case 'warning':
      return (
        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    case 'info':
      return (
        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
} 