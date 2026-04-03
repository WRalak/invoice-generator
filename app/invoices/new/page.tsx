'use client'

import { InvoiceForm } from '../../components/InvoiceForm'
import { QuotaAlert } from '../../components/QuotaAlert'
import { useAuthProtection } from '../../contexts/AuthProtectionContext'

export default function NewInvoicePage() {
  const { requireAuth, isLoading: authLoading } = useAuthProtection()

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Protect the route - this will redirect if not authenticated
  if (!requireAuth()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to generate a professional invoice
          </p>
        </div>

        <QuotaAlert />

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <InvoiceForm />
        </div>
      </div>
    </div>
  )
}