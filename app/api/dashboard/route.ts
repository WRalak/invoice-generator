import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock data for development
const mockInvoices = [
  {
    id: '1',
    number: 'INV-001',
    clientName: 'Acme Corporation',
    total: 1500.00,
    status: 'PAID',
    dueDate: '2024-01-15',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    number: 'INV-002',
    clientName: 'Tech Solutions Inc',
    total: 2500.00,
    status: 'SENT',
    dueDate: '2024-01-20',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    number: 'INV-003',
    clientName: 'Global Services Ltd',
    total: 3200.00,
    status: 'DRAFT',
    dueDate: '2024-01-25',
    createdAt: new Date('2024-01-10'),
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock dashboard data
    const invoiceCount = mockInvoices.length
    const totalRevenue = mockInvoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const recentInvoices = mockInvoices.slice(0, 5)

    return NextResponse.json({
      invoiceCount,
      totalRevenue,
      recentInvoices,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
