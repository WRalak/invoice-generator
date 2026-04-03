'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FileText, LayoutDashboard, CreditCard, LogOut, List, Sun, Moon } from 'lucide-react'
import { ProfileSelector } from './ProfileSelector'
import { useTheme } from '../contexts/ThemeContext'

export function Navbar() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} shadow-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-orange-600" />
              <span className="font-bold text-xl">InvoiceMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/invoices"
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md"
                >
                  <List className="w-4 h-4" />
                  <span>Invoices</span>
                </Link>
                <Link
                  href="/invoices/new"
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Invoice</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pricing</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md"
                  title={theme === 'dark' ? 'Switch to light mode' : theme === 'light' ? 'Switch to dark mode' : 'Switch to system theme'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Moon className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <ProfileSelector />
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md mr-4"
                  title={theme === 'dark' ? 'Switch to light mode' : theme === 'light' ? 'Switch to dark mode' : 'Switch to system theme'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Moon className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Link
                  href="/auth/signin"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}