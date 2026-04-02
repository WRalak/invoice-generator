import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../lib/prisma'
import { getRemainingQuota } from '../../../lib/quota'

export async function GET() {
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

    const [totalInvoices, paidInvoices, overdueInvoices] = await Promise.all([
      prisma.invoice.count({
        where: { userId: user.id },
      }),
      prisma.invoice.aggregate({
        where: { userId: user.id, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: {
          userId: user.id,
          status: { not: 'PAID' },
          dueDate: { lt: new Date() },
        },
      }),
    ])

    const remainingQuota = await getRemainingQuota(user.id)

    return NextResponse.json({
      totalInvoices,
      paidAmount: paidInvoices._sum.total || 0,
      overdueCount: overdueInvoices,
      remainingQuota,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}