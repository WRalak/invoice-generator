import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'
import { generateInvoiceNumber } from '../../../lib/utils'
import { checkQuota, incrementQuota } from '../../../lib/quota'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check quota
    const hasQuota = await checkQuota(user.id)
    if (!hasQuota) {
      return NextResponse.json(
        { error: 'Invoice limit reached. Upgrade your plan to continue.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      clientName,
      clientEmail,
      clientAddress,
      dueDate,
      items,
      tax,
      discount,
      notes,
    } = body

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    )
    const taxAmount = (subtotal * tax) / 100
    const discountAmount = (subtotal * discount) / 100
    const total = subtotal + taxAmount - discountAmount

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: await generateInvoiceNumber(),
        userId: user.id,
        clientName,
        clientEmail,
        clientAddress,
        dueDate: new Date(dueDate),
        subtotal,
        tax,
        discount,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    // Increment quota
    await incrementQuota(user.id)

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}