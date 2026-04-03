'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalRevenue: number
  totalUsers: number
  totalInvoices: number
  averageInvoiceValue: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  userGrowth: Array<{ month: string; users: number }>
  topCustomers: Array<{ name: string; revenue: number; invoices: number }>
  revenueByPlan: Array<{ plan: string; revenue: number; users: number }>
}

export default function AdminAnalytics() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalUsers: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
    monthlyRevenue: [],
    userGrowth: [],
    topCustomers: [],
    revenueByPlan: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  useEffect(() => {
    // Check if user is admin
    if (session?.user?.email !== 'admin@invoicemaster.com') {
      router.push('/dashboard')
      return
    }

    fetchAnalytics()
  }, [session, router])

  const fetchAnalytics = async () => {
    try {
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockAnalytics: AnalyticsData = {
          totalRevenue: 284750,
          totalUsers: 1247,
          totalInvoices: 8934,
          averageInvoiceValue: 31.87,
          monthlyRevenue: [
            { month: 'Jan', revenue: 45000 },
            { month: 'Feb', revenue: 52000 },
            { month: 'Mar', revenue: 48000 },
            { month: 'Apr', revenue: 61000 },
            { month: 'May', revenue: 58000 },
            { month: 'Jun', revenue: 63750 }
          ],
          userGrowth: [
            { month: 'Jan', users: 800 },
            { month: 'Feb', users: 920 },
            { month: 'Mar', users: 1050 },
            { month: 'Apr', users: 1180 },
            { month: 'May', users: 1210 },
            { month: 'Jun', users: 1247 }
          ],
          topCustomers: [
            { name: 'Acme Corporation', revenue: 15420, invoices: 23 },
            { name: 'Tech Solutions Inc', revenue: 28900, invoices: 45 },
            { name: 'Global Industries', revenue: 8750, invoices: 12 },
            { name: 'Digital Agency', revenue: 12450, invoices: 18 },
            { name: 'StartUp Ventures', revenue: 6780, invoices: 9 }
          ],
          revenueByPlan: [
            { plan: 'Free', revenue: 0, users: 342 },
            { plan: 'Pro', revenue: 124750, users: 678 },
            { plan: 'Enterprise', revenue: 160000, users: 227 }
          ]
        }
        setAnalytics(mockAnalytics)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl">Admin Panel</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <Link
              href="/admin"
              className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Users
            </Link>
            <Link
              href="/admin/invoices"
              className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Invoices
            </Link>
            <Link
              href="/admin/analytics"
              className="py-4 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600"
            >
              Analytics
            </Link>
            <Link
              href="/admin/settings"
              className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Overview of your application's performance and user engagement.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalInvoices.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Invoice Value</dt>
                  <dd className="text-lg font-medium text-gray-900">${analytics.averageInvoiceValue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.monthlyRevenue.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{
                        height: `${(item.revenue / Math.max(...analytics.monthlyRevenue.map(r => r.revenue))) * 100}%`
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Growth</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.userGrowth.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{
                        height: `${(item.users / Math.max(...analytics.userGrowth.map(u => u.users))) * 100}%`
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Customers</h3>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.topCustomers.map((customer, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">${customer.revenue.toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{customer.invoices}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue by Plan</h3>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.revenueByPlan.map((plan, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{plan.plan}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">${plan.revenue.toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{plan.users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
