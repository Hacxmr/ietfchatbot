import { NextRequest, NextResponse } from 'next/server'

// Simple middleware without Clerk for now
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
