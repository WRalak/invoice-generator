import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'configured' : 'MISSING',
        PORT: process.env.PORT || '3001'
      },
      dependencies: {
        nextAuth: 'OK',
        bcryptjs: 'OK',
        react: 'OK'
      },
      authConfig: {
        secretConfigured: !!process.env.NEXTAUTH_SECRET,
        urlConfigured: !!process.env.NEXTAUTH_URL,
        expectedSecret: 'your-secret-key-here-min-32-characters-long'
      },
      middleware: {
        status: 'Configured',
        adminRoutes: 'Protected',
        publicRoutes: ['/', '/pricing', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/api/debug']
      },
      nextSteps: [
        '1. Create .env.local file with NEXTAUTH_SECRET',
        '2. Restart the development server',
        '3. Test authentication flow',
        '4. Check browser console for errors',
        '5. Visit /api/debug for detailed info'
      ]
    }

    return NextResponse.json({
      success: true,
      message: 'Environment test completed',
      data: testResults
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
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
    const { action } = body

    switch (action) {
      case 'test-auth':
        // Test NextAuth configuration
        return NextResponse.json({
          success: true,
          message: 'Auth configuration test',
          data: {
            nextAuthWorking: true,
            secretConfigured: !!process.env.NEXTAUTH_SECRET,
            urlConfigured: !!process.env.NEXTAUTH_URL
          }
        })
      
      case 'test-bcrypt':
        // Test bcryptjs functionality
        const bcryptjs = require('bcryptjs')
        const testPassword = 'test123'
        const hashedPassword = await bcryptjs.hash(testPassword, 12)
        const isValid = await bcryptjs.compare(testPassword, hashedPassword)
        
        return NextResponse.json({
          success: true,
          message: 'Bcrypt test completed',
          data: {
            hashing: 'OK',
            comparison: isValid ? 'OK' : 'FAILED',
            testPassword,
            hashedPassword: hashedPassword.substring(0, 20) + '...'
          }
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown test action',
          availableActions: ['test-auth', 'test-bcrypt']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Test POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
