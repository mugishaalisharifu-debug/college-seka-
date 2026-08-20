import { NextResponse } from 'next/server'

// The function MUST be named 'proxy' in Next.js 16+
export function proxy() {
  // Your authentication or redirect logic here
  return NextResponse.next()
}

// Optional: Matcher remains unchanged
export const config = {
  matcher: ['/dashboard/:path*'],
}