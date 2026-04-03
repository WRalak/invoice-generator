import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl
      
      // Allow access to public routes without authentication
      const publicRoutes = ['/', '/pricing', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/api/debug']
      
      if (publicRoutes.some(route => pathname.startsWith(route))) {
        return true
      }
      
      // Allow access to admin routes only for admin users
      if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
        return token?.email === 'admin@invoicemaster.com'
      }
      
      // Require authentication for all other routes
      return !!token
    },
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
