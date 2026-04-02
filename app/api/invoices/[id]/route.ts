import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock data - in real app this would come from database
const mockInvoices = [
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = mockInvoices.find(inv => inv.id === params.id)
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === params.id)
    
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updatedInvoice = {
      ...mockInvoices[invoiceIndex],
      ...body,
      updatedAt: new Date(),
    }
    
    mockInvoices[invoiceIndex] = updatedInvoice

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === params.id)
    
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    mockInvoices.splice(invoiceIndex, 1)

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
