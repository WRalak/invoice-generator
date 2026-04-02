import { prisma } from './prisma'
import { TIER_LIMITS } from './stripe'

export async function checkQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true, quota: true },
  })

  if (!user) return false

  let quota = user.quota
  const now = new Date()

  // Create quota if doesn't exist
  if (!quota) {
    quota = await prisma.quota.create({
      data: {
        userId,
        invoicesUsed: 0,
        invoicesLimit: 5,
        month: now,
      },
    })
  }

  // Reset monthly quota if needed
  if (quota.month.getMonth() !== now.getMonth()) {
    quota = await prisma.quota.update({
      where: { userId },
      data: { invoicesUsed: 0, month: now },
    })
  }

  const tier = user.subscription?.tier || 'FREE'
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS].invoices

  // Unlimited for business
  if (limit === -1) return true

  return quota.invoicesUsed < limit
}

export async function getRemainingQuota(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true, quota: true },
  })

  if (!user) return 0

  let quota = user.quota
  const now = new Date()

  if (!quota) {
    quota = await prisma.quota.create({
      data: {
        userId,
        invoicesUsed: 0,
        invoicesLimit: 5,
        month: now,
      },
    })
  }

  if (quota.month.getMonth() !== now.getMonth()) {
    await prisma.quota.update({
      where: { userId },
      data: { invoicesUsed: 0, month: now },
    })
    const tier = user.subscription?.tier || 'FREE'
    const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS].invoices
    return limit === -1 ? 999 : limit
  }

  const tier = user.subscription?.tier || 'FREE'
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS].invoices

  if (limit === -1) return 999

  return Math.max(0, limit - quota.invoicesUsed)
}

export async function incrementQuota(userId: string): Promise<void> {
  await prisma.quota.update({
    where: { userId },
    data: { invoicesUsed: { increment: 1 } },
  })
}