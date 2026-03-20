import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const employeeId = parseInt(id)

    if (isNaN(employeeId)) {
      return NextResponse.json(
        { error: "Invalid employee id" },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        assignments: {
          include: {
            service: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    let totalHours = 0

    employee.assignments.forEach((assignment) => {
      const service = assignment.service

      if (
        service.startTime &&
        service.actualEndTime &&
        ["assigned", "completed", "cancelled"].includes(service.status)
      ) {
        const diff =
          (new Date(service.actualEndTime).getTime() -
            new Date(service.startTime).getTime()) /
          (1000 * 60 * 60)

        totalHours += diff
      }
    })

    const totalEarnings =
      employee.hourlyRate != null
        ? totalHours * employee.hourlyRate
        : 0

    return NextResponse.json({
      ...employee,
      totalHours,
      totalEarnings,
    })

  } catch (error) {
    console.error("EMPLOYEE DETAIL ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}