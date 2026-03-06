import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // aquí podríamos añadir lógica extra después
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // si no hay sesión → bloquea
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"],
}