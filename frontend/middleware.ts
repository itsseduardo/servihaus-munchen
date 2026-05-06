import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

import { getDashboardPathByRole } from "@/lib/role-redirect"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const role = token?.role as string | undefined

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardPathByRole(role), req.url))
    }

    if (path.startsWith("/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL(getDashboardPathByRole(role), req.url))
    }

    if (path.startsWith("/client") && role !== "CLIENT") {
      return NextResponse.redirect(new URL(getDashboardPathByRole(role), req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/client/:path*"],
}