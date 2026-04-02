export interface UserProfile {
  id: string
  name: string
  email: string
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessWebsite?: string
  logo?: string
  taxId?: string
  currency: string
  language: string
  theme: 'light' | 'dark' | 'system'
  createdAt: Date
  updatedAt: Date
}

export interface ProfileContextType {
  currentProfile: UserProfile | null
  profiles: UserProfile[]
  isLoading: boolean
  error: string | null
  switchProfile: (profileId: string) => Promise<void>
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserProfile>
  updateProfile: (profileId: string, updates: Partial<UserProfile>) => Promise<UserProfile>
  deleteProfile: (profileId: string) => Promise<void>
  refreshProfiles: () => Promise<void>
}
