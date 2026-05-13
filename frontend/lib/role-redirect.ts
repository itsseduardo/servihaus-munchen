export function getRoleRedirectPath(
  role?: string | null,
  mustChangePassword?: boolean
) {
  if (mustChangePassword) {
    return "/change-password"
  }

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

// Alias para compatibilidad con imports antiguos
export const getDashboardPathByRole = getRoleRedirectPath