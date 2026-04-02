import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'
import { getRemainingQuota } from '../../lib/quota'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { quota: true, subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const remainingQuota = await getRemainingQuota(user.id)
    const quota = user.quota

    if (!quota) {
      return NextResponse.json({
        invoicesUsed: 0,
        invoicesLimit: 5,
        remainingQuota: 5,
        isNearLimit: false,
        isOverLimit: false,
      })
    }

    const invoicesLimit = user.subscription?.tier === 'BUSINESS' ? -1 : quota.invoicesLimit
    const isNearLimit = invoicesLimit > 0 && (quota.invoicesUsed / invoicesLimit) >= 0.8
    const isOverLimit = invoicesLimit > 0 && quota.invoicesUsed >= invoicesLimit

    return NextResponse.json({
      invoicesUsed: quota.invoicesUsed,
      invoicesLimit: invoicesLimit === -1 ? 999 : invoicesLimit,
      remainingQuota,
      isNearLimit,
      isOverLimit,
    })
  } catch (error) {
    console.error('Error fetching quota:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
