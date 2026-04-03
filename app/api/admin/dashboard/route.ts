import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock dashboard data - replace with actual database queries
const dashboardData = {
  totalUsers: 1247,
  totalInvoices: 8934,
  totalRevenue: 284750,
  activeUsers: 342,
  recentInvoices: [
    { id: 'INV-001', customer: 'Acme Corp', amount: 1250, status: 'paid', date: '2024-01-15' },
    { id: 'INV-002', customer: 'Tech Solutions', amount: 3400, status: 'pending', date: '2024-01-14' },
    { id: 'INV-003', customer: 'Global Industries', amount: 890, status: 'paid', date: '2024-01-13' }
  ],
  recentUsers: [
    { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2024-01-15', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '2024-01-14', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', joined: '2024-01-13', status: 'pending' }
  ],
  monthlyStats: [
    { month: 'Jan', users: 1247, invoices: 8934, revenue: 284750 },
    { month: 'Feb', users: 1180, invoices: 8234, revenue: 265430 },
    { month: 'Mar', users: 1105, invoices: 7654, revenue: 248120 }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30days'

    // In a real application, you would filter data based on the period
    // For now, return all data
    return NextResponse.json({
      success: true,
      data: dashboardData,
      period,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user?.email !== 'admin@invoicemaster.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'refresh':
        // Refresh dashboard data
        return NextResponse.json({
          success: true,
          message: 'Dashboard data refreshed successfully',
          data: dashboardData,
          lastUpdated: new Date().toISOString()
        })
      
      case 'export':
        // Export dashboard data
        const csvData = convertToCSV(dashboardData)
        return NextResponse.json({
          success: true,
          data: csvData,
          filename: `dashboard_${new Date().toISOString().split('T')[0]}.csv`
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing dashboard request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to convert dashboard data to CSV
function convertToCSV(data: any): string {
  const headers = ['Metric', 'Value']
  const rows = [
    ['Total Users', data.totalUsers],
    ['Total Invoices', data.totalInvoices],
    ['Total Revenue', data.totalRevenue],
    ['Active Users', data.activeUsers]
  ]
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return csvContent
}
