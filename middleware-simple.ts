import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Simple middleware that allows all requests but logs them
  console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)
  
  // For now, allow all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (except auth-related ones)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/(?!auth)).*)",
  ],
} 