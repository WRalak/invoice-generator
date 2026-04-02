import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock data for development
let mockInvoices = [
  {
    id: '1',
    number: 'INV-001',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acme.com',
    clientAddress: '123 Business St, Suite 100, New York, NY 10001',
    total: 1500.00,
    subtotal: 1500.00,
    tax: 0,
    discount: 0,
    status: 'PAID',
    dueDate: '2024-01-15',
    issueDate: '2024-01-01',
    notes: 'Payment terms: Net 30',
    items: [
      {
        id: '1',
        description: 'Web Design Services',
        quantity: 1,
        unitPrice: 1500.00,
        total: 1500.00
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    number: 'INV-002',
    clientName: 'Tech Solutions Inc',
    clientEmail: 'accounts@techsolutions.com',
    clientAddress: '456 Tech Ave, Building 2, San Francisco, CA 94105',
    total: 2500.00,
    subtotal: 2500.00,
    tax: 0,
    discount: 0,
    status: 'SENT',
    dueDate: '2024-01-20',
    issueDate: '2024-01-05',
    notes: 'Monthly retainer for development services',
    items: [
      {
        id: '1',
        description: 'Development Services - Week 1',
        quantity: 40,
        unitPrice: 62.50,
        total: 2500.00
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    number: 'INV-003',
    clientName: 'Global Services Ltd',
    clientEmail: 'finance@globalservices.com',
    clientAddress: '789 Global Way, London, UK',
    total: 3200.00,
    subtotal: 3200.00,
    tax: 0,
    discount: 0,
    status: 'DRAFT',
    dueDate: '2024-01-25',
    issueDate: '2024-01-10',
    notes: 'Consulting project deliverables',
    items: [
      {
        id: '1',
        description: 'Strategic Consulting',
        quantity: 20,
        unitPrice: 160.00,
        total: 3200.00
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    let filteredInvoices = mockInvoices
    if (status) {
      filteredInvoices = mockInvoices.filter(inv => inv.status === status)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

    return NextResponse.json({
      invoices: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: filteredInvoices.length,
        pages: Math.ceil(filteredInvoices.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Generate invoice number
    const invoiceNumber = `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`
    
    const newInvoice = {
      id: Date.now().toString(),
      number: invoiceNumber,
      ...body,
      status: 'DRAFT',
      issueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockInvoices.push(newInvoice)

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
