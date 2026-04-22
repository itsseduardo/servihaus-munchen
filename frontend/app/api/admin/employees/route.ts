import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // 1. Verificamos que el correo no exista ya
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 })
    }

    // 2. ENCRIPTAMOS LA CONTRASEÑA
    // NUNCA guardar contraseñas en texto plano. bcrypt la convierte en un hash indescifrable.
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Guardamos en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "EMPLOYEE",
      }
    })

    // Retornamos el usuario pero sin devolver la contraseña por seguridad
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)

  } catch (error) {
    console.error("ERROR CREATING EMPLOYEE:", error)
    return NextResponse.json({ error: "Error al crear el empleado" }, { status: 500 })
  }
}