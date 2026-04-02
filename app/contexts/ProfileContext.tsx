'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { UserProfile, ProfileContextType } from '@/types/profile'

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      refreshProfiles()
    } else {
      setCurrentProfile(null)
      setProfiles([])
      setIsLoading(false)
    }
  }, [session])

  const refreshProfiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Mock profiles for development
      const mockProfiles: UserProfile[] = [
        {
          id: '1',
          name: session?.user?.name || 'Default User',
          email: session?.user?.email || 'user@example.com',
          businessName: 'Acme Inc.',
          currency: 'USD',
          language: 'en',
          theme: 'light',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
      
      setProfiles(mockProfiles)
      setCurrentProfile(mockProfiles[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const switchProfile = async (profileId: string) => {
    try {
      setError(null)
      const profile = profiles.find(p => p.id === profileId)
      if (!profile) {
        throw new Error('Profile not found')
      }
      
      setCurrentProfile(profile)
      localStorage.setItem('currentProfileId', profileId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch profile')
      throw err
    }
  }

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newProfile: UserProfile = {
        ...profileData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      setProfiles(prev => [...prev, newProfile])
      
      // If this is the first profile, set it as current
      if (profiles.length === 0) {
        setCurrentProfile(newProfile)
        localStorage.setItem('currentProfileId', newProfile.id)
      }
      
      return newProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      throw err
    }
  }

  const updateProfile = async (profileId: string, updates: Partial<UserProfile>) => {
    try {
      setError(null)
      const updatedProfile: UserProfile = {
        ...profiles.find(p => p.id === profileId)!,
        ...updates,
        updatedAt: new Date(),
      }
      
      setProfiles(prev => prev.map(p => p.id === profileId ? updatedProfile : p))
      
      // Update current profile if it's the one being updated
      if (currentProfile?.id === profileId) {
        setCurrentProfile(updatedProfile)
      }
      
      return updatedProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const deleteProfile = async (profileId: string) => {
    try {
      setError(null)
      setProfiles(prev => prev.filter(p => p.id !== profileId))
      
      // If deleting current profile, switch to another one
      if (currentProfile?.id === profileId) {
        const remainingProfiles = profiles.filter(p => p.id !== profileId)
        const newCurrentProfile = remainingProfiles[0] || null
        setCurrentProfile(newCurrentProfile)
        if (newCurrentProfile) {
          localStorage.setItem('currentProfileId', newCurrentProfile.id)
        } else {
          localStorage.removeItem('currentProfileId')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
      throw err
    }
  }

  const value: ProfileContextType = {
    currentProfile,
    profiles,
    isLoading,
    error,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
