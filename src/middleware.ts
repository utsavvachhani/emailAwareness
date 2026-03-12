import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route protection map — which paths need which role
const ROLE_ROUTES: Record<string, string[]> = {
  superadmin: ["/superadmin/dashboard"],
  admin:      ["/admin/dashboard"],
  user:       ["/user/dashboard"],
};

// Public paths — always accessible
const PUBLIC_PATHS = [
  "/",
  "/superadmin/signin",
  "/admin/signin",
  "/admin/signup",
  "/admin/otp",
  "/user/signin",
  "/user/signup",
  "/user/otp",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let Next.js internals, static files, and API routes through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check if path is public
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/") === false && pathname === p);
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get auth from cookie (httpOnly accessToken) or check localStorage via header
  const accessToken = request.cookies.get("accessToken")?.value;

  // If no token and trying to access protected route — determine redirect
  if (!accessToken) {
    if (pathname.startsWith("/superadmin/dashboard")) {
      return NextResponse.redirect(new URL("/superadmin/signin", request.url));
    }
    if (pathname.startsWith("/admin/dashboard")) {
      return NextResponse.redirect(new URL("/admin/signin", request.url));
    }
    if (pathname.startsWith("/user/dashboard")) {
      return NextResponse.redirect(new URL("/user/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/superadmin/dashboard/:path*",
    "/admin/dashboard/:path*",
    "/user/dashboard/:path*",
  ],
};
