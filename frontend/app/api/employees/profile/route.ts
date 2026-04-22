import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
// Importamos el handler para usar las opciones de auth si fuera necesario, 
// aunque NextAuth suele reconocer la sesión si el SECRET está en el .env
import { GET as authGet } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession()
    
    // Si no hay sesión o no hay ID de usuario, devolvemos 401
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscamos al usuario por email para obtener su ID de la tabla User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        employee: true // Incluimos la relación con la tabla Employee
      }
    })

    if (!user || !user.employee) {
      return NextResponse.json({ error: "Perfil de empleado no encontrado" }, { status: 404 })
    }

    // Devolvemos los datos de la tabla Employee
    return NextResponse.json(user.employee)

  } catch (error) {
    console.error("ERROR FETCHING EMPLOYEE PROFILE:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}