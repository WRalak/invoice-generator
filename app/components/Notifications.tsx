'use client'

import React from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function Notifications() {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          getIcon={getIcon}
          getStyles={getStyles}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: any
  onRemove: (id: string) => void
  getIcon: (type: string) => React.ReactNode
  getStyles: (type: string) => string
}

function NotificationItem({ notification, onRemove, getIcon, getStyles }: NotificationItemProps) {
  const [isLeaving, setIsLeaving] = React.useState(false)

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className={`
        p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getStyles(notification.type)}
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-sm mt-1 opacity-90">
                {notification.message}
              </p>
            )}
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium underline mt-2 hover:opacity-80"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <div className="flex items-start gap-2">
            {!notification.persistent && (
              <button
                onClick={handleRemove}
                className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Individual notification component for manual placement
export function Notification({ notification, onRemove }: { notification: any; onRemove: () => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`
      p-4 rounded-lg border shadow-lg backdrop-blur-sm
      ${getStyles(notification.type)}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">
              {notification.message}
            </p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium underline mt-2 hover:opacity-80"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        {!notification.persistent && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
