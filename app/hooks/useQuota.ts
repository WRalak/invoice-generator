import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface QuotaInfo {
  invoicesUsed: number
  invoicesLimit: number
  remainingQuota: number
  isNearLimit: boolean
  isOverLimit: boolean
}

export function useQuota() {
  const { data: session } = useSession()

  const { data: quota, isLoading, error } = useQuery<QuotaInfo>({
    queryKey: ['quota'],
    queryFn: async () => {
      if (!session?.user) throw new Error('Not authenticated')
      
      const response = await fetch('/api/quota')
      if (!response.ok) throw new Error('Failed to fetch quota')
      
      return response.json()
    },
    enabled: !!session?.user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return {
    quota,
    isLoading,
    error,
    canCreateInvoice: quota ? quota.remainingQuota > 0 : false,
    quotaPercentage: quota ? (quota.invoicesUsed / quota.invoicesLimit) * 100 : 0,
  }
}