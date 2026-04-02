'use client'

import { ReactNode } from 'react'
import { AuthProtectionProvider } from '../contexts/AuthProtectionContext'
import { ProtectedRoute } from './ProtectedRoute'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: string
  requiredPermission?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo 
}: AuthGuardProps) {
  return (
    <AuthProtectionProvider requiredRole={requiredRole}>
      <ProtectedRoute
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        fallback={fallback}
        redirectTo={redirectTo}
      >
        {children}
      </ProtectedRoute>
    </AuthProtectionProvider>
  )
}

// Specific guard components for common use cases
export function AuthenticatedGuard({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requiredRole="admin"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Access Required</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </div>
        </div>
      }
    >
      {children}
    </AuthGuard>
  )
}

export function ProfileGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requiredPermission="profile:read"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Profile Setup Required</h2>
            <p className="text-gray-600">Please complete your profile to access this feature.</p>
          </div>
        </div>
      }
    >
      {children}
    </AuthGuard>
  )
}
