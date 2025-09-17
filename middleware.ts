import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/register', '/forgot-password', '/privacy', '/terms']
  
  // Routes that require MFA setup
  const mfaSetupRoute = '/mfa-setup'
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/accounts', '/payments', '/savings', '/loans', '/transactions', '/settings', '/reports', '/customers', '/investments', '/help']

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow MFA setup route
  if (pathname === mfaSetupRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}