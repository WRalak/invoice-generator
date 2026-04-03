'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileProvider } from '../contexts/ProfileContext'
import { AuthProtectionProvider } from '../contexts/AuthProtectionContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { ThemeProvider } from '../contexts/ThemeContext'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProtectionProvider>
            <NotificationProvider>
              <ProfileProvider>
                {children}
              </ProfileProvider>
            </NotificationProvider>
          </AuthProtectionProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}