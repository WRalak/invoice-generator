'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthProtection } from '../contexts/AuthProtectionContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/auth/signin'
}: ProtectedRouteProps) {
  const { status } = useSession()
  const router = useRouter()
  const { 
    isLoading, 
    isAuthenticated, 
    isAuthorized, 
    requireAuth, 
    requireRole, 
    requirePermission 
  } = useAuthProtection()

  useEffect(() => {
    if (status === 'loading' || isLoading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && !requireRole(requiredRole)) {
      return
    }

    if (requiredPermission && !requirePermission(requiredPermission)) {
      return
    }
  }, [status, isLoading, isAuthenticated, requiredRole, requiredPermission, redirectTo, router, requireAuth, requireRole, requirePermission])

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback if not authorized
  if (!isAuthenticated || !isAuthorized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for route protection
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
