import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'all'
    
    // Debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint,
      headers: Object.fromEntries(request.headers.entries()),
      searchParams: Object.fromEntries(searchParams.entries()),
      availableEndpoints: [
        '/api/admin/users',
        '/api/admin/analytics', 
        '/api/admin/settings',
        '/api/admin/invoices',
        '/api/admin/dashboard'
      ],
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing'
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug information retrieved successfully'
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
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
    const { testEndpoint, testPayload } = body
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: 'POST',
      testEndpoint,
      testPayload,
      headers: Object.fromEntries(request.headers.entries()),
      requestInfo: {
        url: request.url,
        method: request.method,
        contentType: request.headers.get('content-type')
      }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug POST request processed successfully'
    })
  } catch (error) {
    console.error('Debug POST endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
