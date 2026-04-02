'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'

const invoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid email address'),
  clientAddress: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  tax: z.number().min(0).max(100),
  discount: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export function InvoiceForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      tax: 0,
      discount: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = (subtotal * (watch('tax') || 0)) / 100
  const discountAmount = (subtotal * (watch('discount') || 0)) / 100
  const total = subtotal + taxAmount - discountAmount

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create invoice')
      }

      const invoice = await response.json()
      onSuccess?.()
      window.location.href = `/invoices/${invoice.id}`
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Failed to create invoice')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client Name *</label>
          <input
            {...register('clientName')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.clientName && (
            <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Client Email *</label>
          <input
            {...register('clientEmail')}
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.clientEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Client Address</label>
          <textarea
            {...register('clientAddress')}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date *</label>
          <input
            {...register('dueDate')}
            type="date"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Invoice Items *</label>
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-6">
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.items?.[index]?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Qty"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-3">
                <input
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="col-span-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {errors.items && (
          <p className="text-red-500 text-sm mt-1">{errors.items.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tax (%)</label>
          <input
            {...register('tax', { valueAsNumber: true })}
            type="number"
            step="0.1"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>
          <input
            {...register('discount', { valueAsNumber: true })}
            type="number"
            step="0.1"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2 text-right">
          <p className="text-gray-600">Subtotal: ${subtotal.toFixed(2)}</p>
          {watch('tax') > 0 && <p className="text-gray-600">Tax: ${taxAmount.toFixed(2)}</p>}
          {watch('discount') > 0 && (
            <p className="text-gray-600">Discount: -${discountAmount.toFixed(2)}</p>
          )}
          <p className="text-2xl font-bold text-blue-600">Total: ${total.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Payment instructions, thank you note, etc."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
      </button>
    </form>
  )
}