import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
