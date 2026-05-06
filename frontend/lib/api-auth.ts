
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth-options"

export type AppRole = "ADMIN" | "EMPLOYEE" | "CLIENT"

export async function requireApiRole(allowedRoles: AppRole[]) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as AppRole | undefined

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  return null
}