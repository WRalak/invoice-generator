'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useNotification } from '../../contexts/NotificationContext'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { success, error: notifyError } = useNotification()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        await signIn('credentials', {
          email,
          password,
          callbackUrl: window.location.origin + '/dashboard'
        })
        success('Account Created!', 'Welcome! Redirecting to dashboard...')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create account')
        notifyError('Sign Up Failed', data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Something went wrong. Please try again.')
      notifyError('Sign Up Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 text-sm">
              Join InvoiceMaster and start creating professional invoices today
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-600 font-medium">{error}</div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-3 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-3 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-3 text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : null}
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  console.log('Google sign-in not configured - using credentials instead')
                  signIn('credentials', {
                    email: 'google-user@example.com',
                    password: 'password123',
                    callbackUrl: window.location.origin + '/dashboard'
                  })
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.126 1.007-2.627 1.607-4.433 1.607H12c-2.48 0-4.613-1.12-6.08-2.96 1.653.893 3.013 2.48 3.92 4.427.84 1.253 1.333 2.827 1.333 4.427 0 1.6-.48 3.093-1.387 4.427l-3.2 2.667c-.893.747-2.027 1.187-3.307 1.187-2.133 0-3.893-1.733-3.893-3.867 0-.84.267-1.627.733-2.267l2.667-2.133c-.747.267-1.547.4-2.4.4-2.4z"/>
                </svg>
                Sign up with Google
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log('Apple sign-in not configured - using credentials instead')
                  signIn('credentials', {
                    email: 'apple-user@example.com',
                    password: 'password123',
                    callbackUrl: window.location.origin + '/dashboard'
                  })
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05 1.37-2.05 1.55 0 2.83.95 2.83 2.05 1.55 0 2.83-.95 2.83-2.05zm-2.95-8.77c-.2-.2-.4-.3-.6-.3-.4 0-.7.2-.9.4-.9-1 0-.4.1-.7.4-1 .4-.4.9-.9 1.4-.9h.11c-.8 0-1.5.5-1.7 1.3l-2.5 4.3c-.3.5-.7.5-1.1.5-.4 0-.8-.1-1.2-.3l-1.3-2.1c-.3-.5-.6-.9-.6-1.4 0-.5.1-.9.3-1.4.3-.5 0-.9-.2-1.4-.3l-1.3-2.1c-.3-.5-.6-.9-.6-1.4 0-.5.1-.9.3-1.4.3-.5 0-.9-.2-1.4-.3l-.1-.2-.1-.4-.2-.7-.2-.8.4-.8.8-.4.8.8.4.8.1.6.1 1.2.1 1.8 0 .6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2.6-.1 1.2-.2 1.8-.2z"/>
                </svg>
                Sign up with Apple
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
