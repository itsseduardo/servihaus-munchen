import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ======================
// GET - Obtener empleados
// ======================
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        profession: true,
        email: true,
        phone: true,
        hourlyRate: true,
        userId: true,
      },
    })

    return NextResponse.json(employees)
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

    if (!body.name || !body.profession || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        profession: body.profession,
        email: body.email,
        phone: body.phone || null,
        hourlyRate: body.hourlyRate
          ? parseFloat(body.hourlyRate)
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