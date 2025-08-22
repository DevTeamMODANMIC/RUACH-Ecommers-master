import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Check if the request is for a product page
  if (url.pathname.startsWith('/products/')) {
    // Redirect to the shop page
    url.pathname = '/shop'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/products/:path*'],
} 