'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '../lib/utils'
import { Download, Mail, Printer, Share2, Eye } from 'lucide-react'
import { LoadingButton } from './LoadingButton'

interface InvoiceViewProps {
  invoice: {
    id: string
    number: string
    clientName: string
    clientEmail: string
    clientAddress: string
    dueDate: string
    subtotal: number
    tax: number
    discount: number
    total: number
    notes?: string
    status: string
    createdAt: string
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  onStatusChange?: (id: string, status: string) => void
  onDelete?: (id: string) => void
}

export function InvoiceView({ invoice, onStatusChange, onDelete }: InvoiceViewProps) {
  const [isSending, setIsSending] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)
    try {
      const response = await fetch(`/api/invoice/${invoice.id}/send`, {
        method: 'POST',
      })
      if (response.ok) {
        // Show success message
        alert('Invoice sent successfully!')
      }
    } catch (error) {
      alert('Failed to send invoice')
    } finally {
      setIsSending(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoice/${invoice.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice.number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      alert('Failed to download invoice')
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      VIEWED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Invoice Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-500 mt-1">#{invoice.number}</p>
          </div>
          <div className="text-right">
            <span className={`status-badge ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Date: {formatDate(invoice.createdAt)}
            </p>
            <p className="text-sm text-gray-500">
              Due: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
            <p className="font-medium text-gray-900">Your Company</p>
            <p className="text-gray-600">Your Address</p>
            <p className="text-gray-600">Your Email</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
            <p className="font-medium text-gray-900">{invoice.clientName}</p>
            <p className="text-gray-600">{invoice.clientAddress}</p>
            <p className="text-gray-600">{invoice.clientEmail}</p>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="p-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-sm font-medium text-gray-500">Description</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Quantity</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Unit Price</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 text-gray-900">{item.description}</td>
                <td className="py-4 text-right text-gray-900">{item.quantity}</td>
                <td className="py-4 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax ({invoice.tax}%):</span>
            <span>{formatCurrency(invoice.subtotal * (invoice.tax / 100))}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount ({invoice.discount}%):</span>
              <span className="text-red-600">-{formatCurrency(invoice.subtotal * (invoice.discount / 100))}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-8 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            isLoading={isDownloading}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </LoadingButton>
          
          <LoadingButton
            isLoading={isSending}
            onClick={handleSendEmail}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </LoadingButton>

          <button className="btn-secondary inline-flex items-center">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>

          <button className="btn-secondary inline-flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
