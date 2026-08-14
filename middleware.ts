import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check for admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    // Redirect straight to our own /login page (NOT NextAuth's /api/auth/signin).
    // NextAuth absolutizes callbackUrl against NEXTAUTH_URL on the signin route,
    // which sent users to the placeholder domain. Going straight to /login keeps
    // the callbackUrl relative (e.g. /admin), so login always stays on this site.
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin routes require a logged-in session; the middleware body above
        // sends non-admin users home.
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
