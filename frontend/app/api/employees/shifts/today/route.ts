import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

function getTodayRange() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return {
    today,
    tomorrow,
  }
}

async function getLoggedEmployee() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      ),
    }
  }

  if (session.user.role !== "EMPLOYEE") {
    return {
      error: NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      ),
    }
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
    return {
      error: NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      ),
    }
  }

  return {
    employee: user.employee,
  }
}

export async function GET() {
  try {
    const result = await getLoggedEmployee()
    if (result.error) return result.error

    const { today, tomorrow } = getTodayRange()

    const shift = await prisma.workShift.findFirst({
      where: {
        employeeId: result.employee.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(shift || null)
  } catch (error) {
    console.error("EMPLOYEE SHIFT TODAY GET ERROR:", error)

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  try {
    const result = await getLoggedEmployee()
    if (result.error) return result.error

    const { today, tomorrow } = getTodayRange()

    const openShift = await prisma.workShift.findFirst({
      where: {
        employeeId: result.employee.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
        clockOut: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!openShift) {
      return NextResponse.json(
        { error: "No hay turno activo para cerrar" },
        { status: 400 }
      )
    }

    const updatedShift = await prisma.workShift.update({
      where: {
        id: openShift.id,
      },
      data: {
        clockOut: new Date(),
      },
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error("EMPLOYEE SHIFT TODAY PATCH ERROR:", error)

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}