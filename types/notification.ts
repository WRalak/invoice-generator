export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  success: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => string
  error: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => string
  warning: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => string
  info: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'title'>>) => string
}
