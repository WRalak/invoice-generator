import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PRICE_IDS = {
  PRO_MONTHLY: 'price_pro_monthly',
  PRO_YEARLY: 'price_pro_yearly',
  BUSINESS_MONTHLY: 'price_business_monthly',
  PER_INVOICE: 'price_per_invoice',
}

export const TIER_LIMITS = {
  FREE: { invoices: 5, price: 0, priceId: null },
  PRO: { invoices: 100, price: 9.99, priceId: PRICE_IDS.PRO_MONTHLY },
  BUSINESS: { invoices: -1, price: 29.99, priceId: PRICE_IDS.BUSINESS_MONTHLY },
}

export const PER_INVOICE_PRICE = 2.00