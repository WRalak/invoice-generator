'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Notification, NotificationContextType, NotificationType } from '@/types/notification'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration (if not persistent)
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    )
  }, [])

  const success = useCallback((title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => {
    return addNotification({ type: 'success', title, message, ...options })
  }, [addNotification])

  const error = useCallback((title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => {
    return addNotification({ type: 'error', title, message, ...options })
  }, [addNotification])

  const warning = useCallback((title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => {
    return addNotification({ type: 'warning', title, message, ...options })
  }, [addNotification])

  const info = useCallback((title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => {
    return addNotification({ type: 'info', title, message, ...options })
  }, [addNotification])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    updateNotification,
    success,
    error,
    warning,
    info,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
