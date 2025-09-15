import { NextRequest, NextResponse } from 'next/server'

// Middleware for handling authentication and request processing
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
