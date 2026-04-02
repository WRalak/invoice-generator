'use client'

import { useState } from 'react'
import { useProfile } from '../contexts/ProfileContext'
import { ChevronDown, Plus, Settings, User } from 'lucide-react'

export function ProfileSelector() {
  const { currentProfile, profiles, switchProfile, isLoading } = useProfile()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-4 h-4" />
        Create Profile
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-blue-600" />
        </div>
        <span className="font-medium">{currentProfile.name}</span>
        {currentProfile.businessName && (
          <span className="text-gray-500 text-xs">{currentProfile.businessName}</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{currentProfile.name}</div>
                {currentProfile.businessName && (
                  <div className="text-xs text-gray-500">{currentProfile.businessName}</div>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  switchProfile(profile.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                  profile.id === currentProfile.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{profile.name}</div>
                  {profile.businessName && (
                    <div className="text-xs text-gray-500">{profile.businessName}</div>
                  )}
                </div>
                {profile.id === currentProfile.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-200">
            <button className="w-full flex items-center gap-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
              <Plus className="w-4 h-4" />
              Create New Profile
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
              <Settings className="w-4 h-4" />
              Manage Profiles
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
