import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 1. VIGILANTE DE LA ZONA ADMIN
    // Si la ruta empieza por /admin y el usuario NO es ADMIN...
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      // Lo redirigimos a la app de empleado
      return NextResponse.redirect(new URL("/employee/dashboard", req.url))
    }

    // 2. VIGILANTE DE LA ZONA EMPLEADO
    // Si un Admin intenta entrar a la vista móvil del empleado...
    if (path.startsWith("/employee") && token?.role === "ADMIN") {
      // Lo devolvemos a su panel de control
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Bloquea completamente a cualquiera que no haya iniciado sesión
        return !!token
      },
    },
  }
)

export const config = {
  // ATENCIÓN AQUÍ: Añadimos la ruta de employee para que el middleware también la proteja
  matcher: ["/admin/:path*", "/employee/:path*"],
}