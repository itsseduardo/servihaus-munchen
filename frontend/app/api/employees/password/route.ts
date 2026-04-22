import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"

export async function PATCH(req: Request) {
  try {
    // Verificamos la sesion activa para identificar al usuario de forma segura
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { newPassword } = body

    // Validacion de longitud minima de seguridad
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" }, 
        { status: 400 }
      )
    }

    // Encriptamos la nueva contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizamos la tabla User filtrando por el email de la sesion activa
    // No usamos IDs enviados desde el cliente para evitar que un usuario cambie la clave de otro
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true, message: "Contraseña actualizada" })

  } catch (error) {
    console.error("PASSWORD UPDATE ERROR:", error)
    return NextResponse.json(
      { error: "Error interno al actualizar la contraseña" }, 
      { status: 500 }
    )
  }
}