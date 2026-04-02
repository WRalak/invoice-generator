import { InvoiceForm } from '../../components/InvoiceForm'
import { QuotaAlert } from '../../components/QuotaAlert'

export default function NewInvoicePage() {
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