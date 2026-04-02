'use client'

import { AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useQuota } from '../hooks/useQuota'

export function QuotaAlert() {
  const { quota, isLoading, canCreateInvoice, quotaPercentage } = useQuota()

  if (isLoading || !quota) {
    return null
  }

  if (quota.isOverLimit) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Invoice Limit Reached
            </h3>
            <p className="text-sm text-red-700 mt-1">
              You've reached your monthly limit of {quota.invoicesLimit} invoices.{' '}
              <Link href="/pricing" className="underline font-medium hover:text-red-600">
                Upgrade your plan
              </Link>{' '}
              to continue creating invoices.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (quota.isNearLimit) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Approaching Invoice Limit
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You've used {quota.invoicesUsed} of {quota.invoicesLimit} invoices this month.{' '}
              <Link href="/pricing" className="underline font-medium hover:text-yellow-600">
                Upgrade
              </Link>{' '}
              to get unlimited invoices.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Invoice Quota
          </h3>
          <p className="text-sm text-green-700 mt-1">
            {quota.invoicesUsed} of {quota.invoicesLimit} invoices used this month
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-green-600">
            {quota.remainingQuota}
          </span>
          <p className="text-xs text-green-600">remaining</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-green-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}