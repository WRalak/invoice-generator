import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test') || 'all'

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      test,
      authConfig: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
      },
      session: null,
      providers: ['credentials'],
      pages: {
        signIn: '/auth/signin'
      }
    }

    // Try to get current session
    try {
      const session = await getServerSession(authOptions)
      debugInfo.session = {
        hasSession: !!session,
        user: session?.user || null,
        expires: session?.expires || null
      }
    } catch (sessionError) {
      debugInfo.session = {
        error: sessionError instanceof Error ? sessionError.message : 'Session error'
      }
    }

    // Test specific components
    switch (test) {
      case 'session':
        return NextResponse.json({
          success: true,
          test: 'session',
          data: debugInfo.session
        })
      
      case 'config':
        return NextResponse.json({
          success: true,
          test: 'config',
          data: debugInfo.authConfig
        })
      
      case 'providers':
        return NextResponse.json({
          success: true,
          test: 'providers',
          data: {
            available: debugInfo.providers,
            configured: authOptions.providers?.map(p => p.name) || []
          }
        })
      
      default:
        return NextResponse.json({
          success: true,
          message: 'Auth debug information',
          data: debugInfo
        })
    }
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, credentials } = body

    switch (action) {
      case 'test-signin':
        // Test sign-in without actual authentication
        if (!credentials?.email || !credentials?.password) {
          return NextResponse.json({
            success: false,
            error: 'Email and password are required'
          }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          message: 'Sign-in test completed',
          data: {
            emailReceived: credentials.email,
            passwordReceived: credentials.password ? 'provided' : 'missing',
            emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email),
            passwordValid: credentials.password.length >= 8
          }
        })
      
      case 'test-signup':
        // Test sign-up validation
        const { name, email, password, confirmPassword } = credentials || {}
        
        const errors = []
        if (!name) errors.push('Name is required')
        if (!email) errors.push('Email is required')
        if (!password) errors.push('Password is required')
        if (password !== confirmPassword) errors.push('Passwords do not match')
        if (password && password.length < 8) errors.push('Password must be at least 8 characters')
        
        return NextResponse.json({
          success: errors.length === 0,
          message: errors.length === 0 ? 'Sign-up validation passed' : 'Sign-up validation failed',
          data: {
            errors,
            fields: {
              name: name ? 'provided' : 'missing',
              email: email ? 'provided' : 'missing',
              password: password ? 'provided' : 'missing',
              confirmPassword: confirmPassword ? 'provided' : 'missing'
            }
          }
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action',
          availableActions: ['test-signin', 'test-signup']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Auth debug POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
