'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import { useNotification } from '../contexts/NotificationContext'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    invoices: 5,
    features: [
      '5 invoices per month',
      'Email support',
      'Basic templates',
      'PDF download',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 9.99,
    period: 'month',
    invoices: 100,
    features: [
      '100 invoices per month',
      'Priority support',
      'Custom branding',
      'Payment tracking',
      'Email reminders',
      'Analytics dashboard',
    ],
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    name: 'Business',
    price: 29.99,
    period: 'month',
    invoices: 'Unlimited',
    features: [
      'Unlimited invoices',
      '24/7 phone support',
      'Team accounts (up to 5)',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { success, error } = useNotification()

  // Handle success/canceled from subscription flow
  useEffect(() => {
    const successParam = searchParams.get('success')
    const canceledParam = searchParams.get('canceled')
    const plan = searchParams.get('plan')

    if (successParam === 'true' && plan) {
      success('Subscription Successful!', `You're now on the ${plan} plan`)
      router.push('/dashboard')
    }

    if (canceledParam === 'true') {
      error('Subscription Canceled', 'You can always subscribe later from your dashboard')
    }
  }, [searchParams, success, error, router])

  const handleSubscribe = async (planName: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (planName === 'Free') {
      success('Free Plan Activated', 'You can start creating invoices right away!')
      router.push('/dashboard')
      return
    }

    if (planName === 'Business') {
      error('Coming Soon', 'Business plan requires manual setup. Please contact our sales team.')
      return
    }

    setIsLoading(planName)
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const { url } = await response.json()
      
      // Redirect to mock checkout URL (in real app, this would be Stripe)
      window.location.href = url
    } catch (err) {
      console.error('Subscription error:', err)
      error('Subscription Failed', 'Unable to process subscription. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your business. Start for free and upgrade
            when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 mb-6">
                  {typeof plan.invoices === 'number'
                    ? `Up to ${plan.invoices} invoices`
                    : `${plan.invoices} invoices`}
                </p>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isLoading === plan.name}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors mb-6 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {isLoading === plan.name ? 'Processing...' : plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Need per-invoice pricing?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact us
            </a>{' '}
            for custom plans starting at $2/invoice.
          </p>
        </div>
      </div>
    </div>
  )
}