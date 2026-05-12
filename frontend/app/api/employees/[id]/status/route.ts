import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const VALID_INACTIVE_REASONS = [
  "SICK_LEAVE",
  "MEDICAL_LEAVE",
  "TERMINATED",
  "SUSPENDED",
  "VACATION",
  "OTHER",
]

function isValidReason(reason: unknown) {
  return typeof reason === "string" && VALID_INACTIVE_REASONS.includes(reason)
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    }
  }

  return {
    userId: session.user.id,
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const employeeId = Number(id)

    if (!Number.isInteger(employeeId)) {
      return NextResponse.json(
        { error: "Invalid employee id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const isActive = Boolean(body.isActive)

    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    if (!isActive) {
      const inactiveReason = body.inactiveReason

      if (!isValidReason(inactiveReason)) {
        return NextResponse.json(
          { error: "Bitte wählen Sie einen gültigen Inaktivitätsgrund." },
          { status: 400 }
        )
      }

      const inactiveDetails =
        typeof body.inactiveDetails === "string"
          ? body.inactiveDetails.trim()
          : ""

      const inactiveUntil =
        typeof body.inactiveUntil === "string" && body.inactiveUntil
          ? new Date(body.inactiveUntil)
          : null

      const updatedEmployee = await prisma.employee.update({
        where: {
          id: employeeId,
        },
        data: {
          active: false,
          isActive: false,
          inactiveReason,
          inactiveDetails: inactiveDetails || null,
          inactiveSince: new Date(),
          inactiveUntil,
          reactivatedAt: null,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: "DEACTIVATE_EMPLOYEE",
          entityType: "EMPLOYEE",
          entityId: employeeId,
          userId: auth.userId,
          oldValue: JSON.stringify({
            active: employee.active,
            isActive: employee.isActive,
            inactiveReason: employee.inactiveReason,
            inactiveDetails: employee.inactiveDetails,
            inactiveSince: employee.inactiveSince,
            inactiveUntil: employee.inactiveUntil,
          }),
          newValue: JSON.stringify({
            active: false,
            isActive: false,
            inactiveReason,
            inactiveDetails,
            inactiveUntil,
          }),
          reason: inactiveDetails || inactiveReason,
        },
      })

      return NextResponse.json(updatedEmployee)
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        active: true,
        isActive: true,
        inactiveReason: null,
        inactiveDetails: null,
        inactiveSince: null,
        inactiveUntil: null,
        reactivatedAt: new Date(),
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "REACTIVATE_EMPLOYEE",
        entityType: "EMPLOYEE",
        entityId: employeeId,
        userId: auth.userId,
        oldValue: JSON.stringify({
          active: employee.active,
          isActive: employee.isActive,
          inactiveReason: employee.inactiveReason,
          inactiveDetails: employee.inactiveDetails,
          inactiveSince: employee.inactiveSince,
          inactiveUntil: employee.inactiveUntil,
        }),
        newValue: JSON.stringify({
          active: true,
          isActive: true,
        }),
        reason: "Employee reactivated by admin",
      },
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("EMPLOYEE STATUS UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}