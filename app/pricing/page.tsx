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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start free and scale as you grow. All plans include our core features with no hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.popular 
                  ? 'border-blue-500 ring-4 ring-blue-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                    </span>
                    {typeof plan.price === 'number' && (
                      <span className="text-xl text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    {typeof plan.invoices === 'number'
                      ? `Up to ${plan.invoices} invoices per month`
                      : `${plan.invoices} invoices`}
                  </p>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isLoading === plan.name}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isLoading === plan.name ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            We offer custom pricing for businesses with unique needs. Contact our sales team for a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:sales@invoicemaster.com"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </a>
            <span className="text-gray-500">
              Custom plans starting at $2/invoice
            </span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-blue-900 mb-2">30-Day Money Back Guarantee</h4>
            <p className="text-blue-700">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}