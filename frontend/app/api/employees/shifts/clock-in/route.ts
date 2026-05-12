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

export async function POST(req: Request) {
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
        { error: "No tienes permisos para iniciar turno" },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const justification = body.justification?.trim() || null

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

    const { today, tomorrow } = getTodayRange()

    const existingShift = await prisma.workShift.findFirst({
      where: {
        employeeId: user.employee.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (existingShift && !existingShift.clockOut) {
      return NextResponse.json(existingShift)
    }

    if (existingShift?.clockOut) {
      return NextResponse.json(
        { error: "Ya finalizaste tu turno de hoy" },
        { status: 400 }
      )
    }

    const firstService = await prisma.service.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        assignments: {
          some: {
            employeeId: user.employee.id,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    let status: "ON_TIME" | "LATE" = "ON_TIME"
    const now = new Date()

    if (firstService?.startTime) {
      const scheduledTime = new Date(firstService.startTime)
      scheduledTime.setMinutes(scheduledTime.getMinutes() + 5)

      if (now > scheduledTime) {
        status = "LATE"

        if (!justification) {
          return NextResponse.json(
            { error: "Justificación requerida por tardanza" },
            { status: 400 }
          )
        }
      }
    }

    const shift = await prisma.workShift.create({
      data: {
        employeeId: user.employee.id,
        date: today,
        status,
        justification: status === "LATE" ? justification : null,
        clockIn: now,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error("EMPLOYEE CLOCK-IN ERROR:", error)

    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    )
  }
}