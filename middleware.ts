import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/register", "/forgot-password", "/terms", "/privacy"];
  
  // Admin routes that require admin role
  const adminRoutes = ["/admin"];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For admin routes, additional role check would be needed
  // This would require decoding the JWT token to check user role
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // In a real implementation, decode JWT and check role
    // For now, allow access if token exists
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};