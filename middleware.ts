// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check token for protected routes
  const token = request.cookies.get('credixa-token')?.value
  const demoMode = request.cookies.get('credixa-demo')?.value

  if (!token && !demoMode) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Demo mode bypass (no real DB needed)
  if (demoMode && !token) {
    if (pathname.startsWith('/api/')) {
      // API calls in demo mode return mock success
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  if (token) {
    const user = await verifyToken(token)
    if (!user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('credixa-token')
      return response
    }
  }

  // Redirect logged-in users away from login
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
