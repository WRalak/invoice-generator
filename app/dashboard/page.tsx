'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useProfile } from '../contexts/ProfileContext'
import { useAuthProtection } from '../contexts/AuthProtectionContext'
import { useNotification } from '../contexts/NotificationContext'
import { FileText, DollarSign, Clock, TrendingUp, Plus, Building2, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { handleApiError } from '../lib/api'

interface Stats {
  totalInvoices: number
  paidAmount: number
  overdueCount: number
  remainingQuota: number
}

interface Invoice {
  id: string
  number: string
  clientName: string
  total: number
  status: string
  dueDate: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { currentProfile, profiles } = useProfile()
  const { requireAuth } = useAuthProtection()
  const { success, error, warning, info } = useNotification()
  
  // Protect the route
  if (!requireAuth()) {
    return null
  }

  // Show welcome notification on first load
  useEffect(() => {
    if (currentProfile && session) {
      success('Welcome back!', `You're now viewing ${currentProfile.name}'s dashboard`)
    }
  }, [currentProfile, session, success])
  
  const { data: dashboardData, isLoading, error: queryError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      if (!session?.user) {
        throw new Error('Not authenticated')
      }
      const response = await fetch('/api/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
    enabled: !!session?.user,
  })

  const stats = {
    totalInvoices: dashboardData?.invoiceCount || 0,
    paidAmount: dashboardData?.totalRevenue || 0,
    overdueCount: 0, // TODO: Calculate from invoices
    remainingQuota: 10, // TODO: Get from user quota
  }

  const recentInvoices = dashboardData?.recentInvoices || []

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  return (
    <div className="p-4 md:p-8">
      {/* Profile Info */}
      {currentProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {currentProfile.businessName ? (
                  <Building2 className="w-8 h-8 text-blue-600" />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentProfile.name}</h2>
                {currentProfile.businessName && (
                  <p className="text-gray-600">{currentProfile.businessName}</p>
                )}
                <p className="text-sm text-gray-500">
                  {currentProfile.currency} • {currentProfile.language.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Profile</p>
              <p className="text-xs text-gray-400">
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} available
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.name}
          {currentProfile && ` • ${currentProfile.name}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Invoices</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">${stats.paidAmount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Paid Amount</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.overdueCount}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Overdue Invoices</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.remainingQuota}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Remaining Invoices</p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {queryError ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Error loading dashboard: {queryError.message}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading dashboard...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentInvoices?.map((invoice: Invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invoice.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!recentInvoices || recentInvoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No invoices yet. Create your first invoice to get started.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}