import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs" 

// ======================
// GET - Obtener empleados (Intacto)
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
          select: { assignments: true },
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
      contractedHoursPerWeek: emp.contractedHoursPerWeek, 
      vacationDaysPerYear: emp.vacationDaysPerYear,
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
// POST - Crear empleado (Actualizado con Login)
// ======================
export async function POST(req: Request) {
  try {
    const body = await req.json()

    //   Validamos que también envíen la contraseña
    if (!body.firstName || !body.lastName || !body.profession || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    //  Verificamos que el email no exista en la tabla User
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "El correo ya está registrado en el sistema" }, 
        { status: 400 }
      )
    }

    //   Encriptamos la contraseña y armamos el nombre completo
    const hashedPassword = await bcrypt.hash(body.password, 10)
    const fullName = `${body.firstName} ${body.lastName}`

    //  Creación Anidada (User + Employee) conservando tu lógica de parsing
    const newUserAndEmployee = await prisma.user.create({
      data: {
        name: fullName,
        email: body.email,
        password: hashedPassword,
        role: "EMPLOYEE",
        
        // Creamos al empleado asociado en el mismo paso
        employee: {
          create: {
            firstName: body.firstName,
            lastName: body.lastName,
            profession: body.profession,
            email: body.email,
            phone: body.phone || null,
            
            // Conservamos tu excelente lógica de formateo numérico
            hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
            employmentType: body.employmentType || "MINIJOB_538", 
            contractedHoursPerWeek: body.contractedHoursPerWeek 
              ? parseFloat(body.contractedHoursPerWeek) 
              : null,
            vacationDaysPerYear: body.vacationDaysPerYear 
              ? parseInt(body.vacationDaysPerYear) 
              : 20, // Mínimo legal por defecto
          }
        }
      },
      // Le pedimos a Prisma que nos devuelva también los datos del empleado recién creado
      include: {
        employee: true 
      }
    })

    // Devolvemos el empleado creado (que está dentro del objeto newUserAndEmployee)
    return NextResponse.json(newUserAndEmployee.employee)

  } catch (error) {
    console.error("EMPLOYEE CREATE ERROR:", error)
    return NextResponse.json(
      { error: "Error creating employee" },
      { status: 500 }
    )
  }
}