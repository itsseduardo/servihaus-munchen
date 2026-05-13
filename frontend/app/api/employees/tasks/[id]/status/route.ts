import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ALLOWED_STATUSES = [
  "assigned",
  "traveling",
  "in_progress",
  "completed",
] as const

type AllowedStatus = (typeof ALLOWED_STATUSES)[number]

function isAllowedStatus(status: unknown): status is AllowedStatus {
  return (
    typeof status === "string" &&
    ALLOWED_STATUSES.includes(status as AllowedStatus)
  )
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function isEmployeeInactiveOnDate(
  employee: {
    active?: boolean | null
    isActive?: boolean | null
    inactiveSince?: Date | null
    inactiveUntil?: Date | null
  },
  dateValue: Date = new Date()
) {
  const isMarkedInactive =
    employee.isActive === false || employee.active === false

  if (!isMarkedInactive) return false

  const targetDate = startOfDay(dateValue)

  const inactiveSince = employee.inactiveSince
    ? startOfDay(new Date(employee.inactiveSince))
    : null

  const inactiveUntil = employee.inactiveUntil
    ? endOfDay(new Date(employee.inactiveUntil))
    : null

  if (inactiveSince && targetDate < inactiveSince) {
    return false
  }

  if (inactiveUntil && targetDate > inactiveUntil) {
    return false
  }

  return true
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
        { error: "No tienes permisos para actualizar esta tarea" },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const serviceId = Number(id)

    if (!Number.isInteger(serviceId)) {
      return NextResponse.json(
        { error: "ID de servicio inválido" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const status = body.status

    const overtimeReason =
      typeof body.overtimeReason === "string"
        ? body.overtimeReason.trim()
        : ""

    if (!isAllowedStatus(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
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

    const employeeIsInactiveToday = isEmployeeInactiveOnDate(
      user.employee,
      new Date()
    )

    if (employeeIsInactiveToday) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta está inactiva actualmente. Puedes ver tus tareas, pero no puedes cambiar estados ni registrar tiempos.",
        },
        { status: 403 }
      )
    }

    const assignedTask = await prisma.service.findFirst({
      where: {
        id: serviceId,
        assignments: {
          some: {
            employeeId: user.employee.id,
          },
        },
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!assignedTask) {
      return NextResponse.json(
        { error: "La tarea no existe o no está asignada a este empleado" },
        { status: 404 }
      )
    }

    const updateData: Prisma.ServiceUpdateInput = {
      status,
    }

    const now = new Date()

    if (status === "traveling") {
      updateData.actualTravelStartTime = now
    }

    if (status === "in_progress") {
      updateData.actualStartTime = now
    }

    if (status === "completed") {
      updateData.actualEndTime = now

      if (overtimeReason) {
        updateData.overtimeJustification = overtimeReason
        updateData.extraHoursReason = overtimeReason
      }
    }

    const updatedTask = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: updateData,
      include: {
        client: true,
        serviceCode: true,
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("ERROR ACTUALIZANDO ESTADO DE TAREA:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}