import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ======================
// GET - Obtener empleados
// ======================
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    })

    const formatted = employees.map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      profession: emp.profession,
      email: emp.email,
      phone: emp.phone,
      hourlyRate: emp.hourlyRate,
      employmentType: emp.employmentType,
      contractedHoursPerDay: emp.contractedHoursPerDay,
      userId: emp.userId,
      hasLogin: !!emp.userId,
      servicesCount: emp._count.assignments,
      createdAt: emp.createdAt,
    }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error("EMPLOYEES GET ERROR:", error)
    return NextResponse.json(
      { error: "Error fetching employees" },
      { status: 500 }
    )
  }
}

// ======================
// POST - Crear empleado
// ======================
export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.firstName || !body.lastName || !body.profession || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        profession: body.profession,
        email: body.email,
        phone: body.phone || null,
        hourlyRate: body.hourlyRate
          ? parseFloat(body.hourlyRate)
          : null,
        employmentType: body.employmentType || "HOURLY",
        contractedHoursPerDay: body.contractedHoursPerDay
          ? parseFloat(body.contractedHoursPerDay)
          : null,
      },
    })

    return NextResponse.json(employee)

  } catch (error) {
    console.error("EMPLOYEE CREATE ERROR:", error)
    return NextResponse.json(
      { error: "Error creating employee" },
      { status: 500 }
    )
  }
}