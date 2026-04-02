// Database Types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  number: string
  userId: string
  clientName: string
  clientEmail: string
  clientAddress: string
  dueDate: Date
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  tier: 'FREE' | 'PRO' | 'BUSINESS'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt: Date
  updatedAt: Date
}

export interface Quota {
  id: string
  userId: string
  invoicesUsed: number
  invoicesLimit: number
  month: Date
  createdAt: Date
  updatedAt: Date
}

// API Types
export interface CreateInvoiceRequest {
  clientName: string
  clientEmail: string
  clientAddress: string
  dueDate: string
  items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]
  tax: number
  discount: number
  notes?: string
}

export interface DashboardStats {
  totalInvoices: number
  paidAmount: number
  overdueCount: number
  remainingQuota: number
}

// Component Props Types
export interface InvoiceFormData {
  clientName: string
  clientEmail: string
  clientAddress: string
  dueDate: string
  items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]
  tax: number
  discount: number
  notes?: string
}

// Utility Types
export type InvoiceStatus = Invoice['status']
export type SubscriptionTier = Subscription['tier']
export type SubscriptionStatus = Subscription['status']