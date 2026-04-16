import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// ==========================================
// GET - Detalle del Empleado (Libro de Horas)
// ==========================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const employeeId = parseInt(id)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee id" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        assignments: {
          include: {
            service: {
              include: {
                serviceCode: true,
                client: true,
              },
            },
          },
        },
        // INCLUIMOS LOS BLOQUES MANUALES (Punto 1 de la charla)
        timeBlocks: true, 
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    let totalWorkedHours = 0
    let totalTravelHours = 0
    let totalPaidHours = 0

    // 1. HORAS DE SERVICIOS
    employee.assignments.forEach((assignment) => {
      const service = assignment.service
      if (service.status !== "completed") return

      let workedHours = service.duration || 0

      if (service.actualStartTime && service.actualEndTime) {
        const start = new Date(service.actualStartTime)
        const end = new Date(service.actualEndTime)
        const realDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        if (realDiff > 0) workedHours = realDiff
      }

      const travelHours = (service.travelTime || 0) / 60
      totalWorkedHours += workedHours
      totalTravelHours += travelHours
      totalPaidHours += (workedHours + travelHours)
    })

    // 2. SUMAR BLOQUES DE TIEMPO MANUALES (Vacaciones, Cancelaciones pagadas, etc.)
    // Esto es lo que permite "justificar" por qué un empleado llegó a sus 20h
    employee.timeBlocks.forEach((block: any) => {
      totalPaidHours += block.duration
      // También lo sumamos al "Ist-Stunden" para que el balance semanal no salga negativo
      totalWorkedHours += block.duration 
    })

    const totalEarnings = employee.hourlyRate ? totalPaidHours * employee.hourlyRate : 0

    return NextResponse.json({
      ...employee,
      totalWorkedHours,
      totalTravelHours,
      totalPaidHours,
      totalEarnings,
    })

  } catch (error) {
    console.error("EMPLOYEE DETAIL GET ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ==========================================
// PUT - Actualizar Contrato / Datos Empleado
// ==========================================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const employeeId = parseInt(id)
    const body = await req.json()

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        profession: body.profession,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        employmentType: body.employmentType,
        contractedHoursPerWeek: body.contractedHoursPerWeek ? parseFloat(body.contractedHoursPerWeek) : null,
        vacationDaysPerYear: body.vacationDaysPerYear ? parseInt(body.vacationDaysPerYear) : 20,
      },
    })

    return NextResponse.json(updatedEmployee)

  } catch (error) {
    console.error("EMPLOYEE UPDATE ERROR:", error)
    return NextResponse.json({ error: "Could not update employee" }, { status: 500 })
  }
}