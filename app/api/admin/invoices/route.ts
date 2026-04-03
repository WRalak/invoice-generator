import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock invoice data - replace with actual database
let invoices = [
  {
    id: 'INV-001',
    customerId: 1,
    customerName: 'Acme Corporation',
    customerEmail: 'billing@acme.com',
    amount: 1250,
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    items: [
      { description: 'Web Development Services', quantity: 40, rate: 50, total: 2000 },
      { description: 'UI/UX Design', quantity: 20, rate: 75, total: 1500 }
    ],
    notes: 'Payment received via wire transfer',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'INV-002',
    customerId: 2,
    customerName: 'Tech Solutions Inc',
    customerEmail: 'accounts@techsolutions.com',
    amount: 3400,
    status: 'pending',
    date: '2024-01-14',
    dueDate: '2024-02-14',
    items: [
      { description: 'Software License', quantity: 5, rate: 500, total: 2500 },
      { description: 'Support Package', quantity: 1, rate: 900, total: 900 }
    ],
    notes: 'Payment due in 30 days',
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-14T09:30:00Z'
  },
  {
    id: 'INV-003',
    customerId: 3,
    customerName: 'Global Industries',
    customerEmail: 'finance@globalindustries.com',
    amount: 890,
    status: 'paid',
    date: '2024-01-13',
    dueDate: '2024-02-13',
    items: [
      { description: 'Consulting Services', quantity: 10, rate: 89, total: 890 }
    ],
    notes: 'Paid via credit card',
    createdAt: '2024-01-13T11:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  }
]

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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filter invoices based on search and status
    let filteredInvoices = invoices.filter(invoice => {
      const matchesSearch = invoice.customerName.toLowerCase().includes(search.toLowerCase()) ||
                           invoice.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                           invoice.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'all' || invoice.status === status
      return matchesSearch && matchesStatus
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: filteredInvoices.length,
        totalPages: Math.ceil(filteredInvoices.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
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
    const { 
      customerName, 
      customerEmail, 
      amount, 
      items, 
      dueDate, 
      notes 
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !amount || !items || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new invoice
    const newInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      customerId: invoices.length + 1,
      customerName,
      customerEmail,
      amount,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      dueDate,
      items,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    invoices.push(newInvoice)

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: 'Invoice created successfully'
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, status, notes } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Find and update invoice
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id)
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Update invoice fields
    if (status) {
      invoices[invoiceIndex].status = status
    }
    if (notes !== undefined) {
      invoices[invoiceIndex].notes = notes
    }
    invoices[invoiceIndex].updatedAt = new Date().toISOString()

    return NextResponse.json({
      success: true,
      data: invoices[invoiceIndex],
      message: 'Invoice updated successfully'
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Find and delete invoice
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id)
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    invoices.splice(invoiceIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
