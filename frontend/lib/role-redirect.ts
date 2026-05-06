
export function getDashboardPathByRole(role?: string | null) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "EMPLOYEE":
      return "/employee/dashboard"
    case "CLIENT":
      return "/client/dashboard"
    default:
      return "/login"
  }
}