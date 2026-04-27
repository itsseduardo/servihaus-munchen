import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clientInventoryId } = await req.json()

    if (!clientInventoryId) {
      return NextResponse.json({ error: "Falta el ID del inventario" }, { status: 400 })
    }

    // Al reportar, simplemente bajamos la cantidad a 0 (Esto dispara la alerta para el Admin)
    const updatedInventory = await prisma.clientInventory.update({
      where: { id: parseInt(clientInventoryId) },
      data: {
        quantity: 0
      }
    })

    return NextResponse.json({ success: true, inventory: updatedInventory })

  } catch (error) {
    console.error("ERROR REPORTING LOW STOCK:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}