'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAuthDebug = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/debug')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false
      })
      setTestResults({ signInResult: result })
    } catch (error) {
      setTestResults({ signInError: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testSignOut = async () => {
    try {
      await signOut()
      setTestResults({ signOutSuccess: true })
    } catch (error) {
      setTestResults({ signOutError: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  useEffect(() => {
    testAuthDebug()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug Test</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            {session && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p><strong>User ID:</strong> {session.user?.id}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={testAuthDebug}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Auth Debug'}
            </button>
            
            <button
              onClick={testSignIn}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Sign-In
            </button>
            
            <button
              onClick={testSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Sign-Out
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/auth/signin" className="block text-blue-600 hover:text-blue-800">
              → Sign In Page
            </Link>
            <Link href="/auth/signup" className="block text-blue-600 hover:text-blue-800">
              → Sign Up Page
            </Link>
            <Link href="/auth/forgot-password" className="block text-blue-600 hover:text-blue-800">
              → Forgot Password
            </Link>
            <Link href="/admin" className="block text-blue-600 hover:text-blue-800">
              → Admin Panel
            </Link>
            <Link href="/dashboard" className="block text-blue-600 hover:text-blue-800">
              → Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
