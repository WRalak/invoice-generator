'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuthProtectionContextType {
  isLoading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
  requiredRole?: string
  userRole: string
  checkPermission: (permission: string) => boolean
  requireAuth: () => boolean
  requireRole: (role: string) => boolean
  requirePermission: (permission: string) => boolean
  redirectToLogin: () => void
}

const AuthProtectionContext = createContext<AuthProtectionContextType | undefined>(undefined)

export function AuthProtectionProvider({ 
  children, 
  requiredRole 
}: { 
  children: ReactNode
  requiredRole?: string 
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    const authenticated = !!session?.user
    setIsAuthenticated(authenticated)

    if (!authenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/signin')
      setIsAuthorized(false)
    } else {
      // Check role-based authorization
      const role = session?.user?.role || 'user'
      setUserRole(role)
      
      const authorized = requiredRole ? role === requiredRole : true
      setIsAuthorized(authorized)

      // Redirect if not authorized
      if (!authorized) {
        router.push('/unauthorized')
      }
    }

    setIsLoading(false)
  }, [session, status, requiredRole, router])

  const checkPermission = (permission: string): boolean => {
    // Mock permission check - in real app, this would check user permissions
    const userPermissions = session?.user?.permissions || []
    return userPermissions.includes(permission)
  }

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      redirectToLogin()
      return false
    }
    return true
  }

  const requireRole = (role: string): boolean => {
    if (!isAuthenticated) {
      redirectToLogin()
      return false
    }
    
    if (userRole !== role) {
      router.push('/unauthorized')
      return false
    }
    
    return true
  }

  const requirePermission = (permission: string): boolean => {
    if (!isAuthenticated) {
      redirectToLogin()
      return false
    }
    
    if (!checkPermission(permission)) {
      router.push('/unauthorized')
      return false
    }
    
    return true
  }

  const redirectToLogin = () => {
    router.push('/auth/signin')
  }

  const value: AuthProtectionContextType = {
    isLoading,
    isAuthenticated,
    isAuthorized,
    requiredRole,
    userRole,
    checkPermission,
    requireAuth,
    requireRole,
    requirePermission,
    redirectToLogin,
  }

  return (
    <AuthProtectionContext.Provider value={value}>
      {children}
    </AuthProtectionContext.Provider>
  )
}

export function useAuthProtection() {
  const context = useContext(AuthProtectionContext)
  if (context === undefined) {
    throw new Error('useAuthProtection must be used within an AuthProtectionProvider')
  }
  return context
}
