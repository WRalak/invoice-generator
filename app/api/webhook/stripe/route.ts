import { NextRequest, NextResponse } from 'next/server'
import { stripe, TIER_LIMITS } from '../../../lib/stripe'
import { prisma } from '../../../lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { userId, tier } = session.metadata!

      const priceId = session.line_items?.data[0]?.price?.id
      const tierLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: priceId,
          tier: tier as any,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: priceId,
          tier: tier as any,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // Update quota limit
      await prisma.quota.upsert({
        where: { userId },
        update: { invoicesLimit: tierLimit.invoices },
        create: {
          userId,
          invoicesLimit: tierLimit.invoices,
          invoicesUsed: 0,
          month: new Date(),
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (dbSubscription) {
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: 'CANCELLED',
            tier: 'FREE',
          },
        })

        await prisma.quota.update({
          where: { userId: dbSubscription.userId },
          data: { invoicesLimit: 5 },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}