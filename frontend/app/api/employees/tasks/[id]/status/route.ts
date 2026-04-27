import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // Si usas Next.js 14 o anterior quita el "Promise" y usa: { params: { id: string } }
) {
  try {
    // 1. Verificación de seguridad
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Extraer el ID de la URL y el nuevo estado del cuerpo de la petición
    const { id } = await context.params
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: "Falta el estado (status)" }, { status: 400 })
    }

    // 3. Preparar los datos a actualizar
    const updateData: any = { status }

    // MAGIA DE AUDITORÍA: Guardamos la hora exacta en la que toca el botón
    const now = new Date()
    if (status === "in_progress") {
      updateData.actualStartTime = now
    } else if (status === "completed") {
      updateData.actualEndTime = now
    }

    // 4. Actualizar en la base de datos
    const updatedTask = await prisma.service.update({
      where: { id: parseInt(id) },
      data: updateData,
      // Incluimos datos extra para que el frontend (la TaskCard) se actualice bonito
      include: {
        client: true,
        serviceCode: true,
        assignments: {
          include: { employee: true }
        }
      }
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