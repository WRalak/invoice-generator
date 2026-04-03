import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

// Mock subscription data for development
const mockSubscriptions = new Map()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock subscription data
    const subscription = mockSubscriptions.get(session.user.id) || {
      plan: 'FREE',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, plan } = await request.json()

    // Mock subscription creation
    const subscription = {
      plan: plan || 'PRO',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stripeCustomerId: `cus_mock_${session.user.id}`,
      stripeSubscriptionId: `sub_mock_${session.user.id}`,
    }

    mockSubscriptions.set(session.user.id, subscription)

    // Mock checkout session URL
    const checkoutUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?success=true&plan=${plan}`

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
