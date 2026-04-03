import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock analytics data - replace with actual database queries
const analyticsData = {
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
      data: analyticsData,
      period
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
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
    const { action, data } = body

    switch (action) {
      case 'export':
        // Handle analytics export
        const csvData = convertToCSV(data || analyticsData)
        return NextResponse.json({
          success: true,
          data: csvData,
          filename: `analytics_${new Date().toISOString().split('T')[0]}.csv`
        })
      
      case 'refresh':
        // Handle analytics refresh
        return NextResponse.json({
          success: true,
          message: 'Analytics refreshed successfully',
          data: analyticsData
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing analytics request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  const headers = Object.keys(data).filter(key => typeof data[key] !== 'object')
  const csvHeaders = headers.join(',')
  
  const csvRows = headers.map(header => data[header])
  return `${csvHeaders}\n${csvRows.join(',')}`
}
