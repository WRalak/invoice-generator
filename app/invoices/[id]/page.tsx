'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Download, Mail, Printer } from 'lucide-react'
import { useAuthProtection } from '../../contexts/AuthProtectionContext'
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  number: string
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string
  items: InvoiceItem[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params.id as string
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

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${id}`)
      if (!response.ok) throw new Error('Failed to fetch invoice')
      return response.json()
    },
  })

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoice/${id}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice?.number}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Invoice not found</div>
      </div>
    )
  }

  const taxAmount = (invoice.subtotal * invoice.tax) / 100
  const discountAmount = (invoice.subtotal * invoice.discount) / 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Mail className="w-4 h-4" /> Send Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                <p className="text-gray-600 mt-1">#{invoice.number}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Status</div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>

            {/* Company & Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">From:</h3>
                <p className="text-gray-600">InvoiceMaster Inc.</p>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">New York, NY 10001</p>
                <p className="text-gray-600">contact@invoicemaster.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="text-gray-600 font-medium">{invoice.clientName}</p>
                <p className="text-gray-600">{invoice.clientEmail}</p>
                {invoice.clientAddress && (
                  <p className="text-gray-600">{invoice.clientAddress}</p>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Description</th>
                  <th className="text-right py-3">Qty</th>
                  <th className="text-right py-3">Unit Price</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-3">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({invoice.tax}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({invoice.discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-gray-600 text-sm">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
