import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        employee: true,
      },
    })

    if (!user?.employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.employee.id,
      userId: user.id,
      firstName: user.employee.firstName,
      lastName: user.employee.lastName,
      fullName: `${user.employee.firstName} ${user.employee.lastName}`,
      email: user.employee.email,
      phone: user.employee.phone,
      profession: user.employee.profession,
      employmentType: user.employee.employmentType,
      isActive: user.employee.isActive,
      active: user.employee.active,
      inactiveReason: user.employee.inactiveReason,
      inactiveDetails: user.employee.inactiveDetails,
      inactiveSince: user.employee.inactiveSince,
      inactiveUntil: user.employee.inactiveUntil,
      reactivatedAt: user.employee.reactivatedAt,
    })
  } catch (error) {
    console.error("EMPLOYEE ME ERROR:", error)

    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    )
  }
}