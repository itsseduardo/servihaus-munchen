import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  // 1. Cambiamos la firma de params a una Promesa
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { quantity } = await req.json()
    
    // 2. Extraemos el id usando 'await'
    const { id } = await context.params
    const productId = parseInt(id)

    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Ungültige Menge" }, { status: 400 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        globalStock: {
          increment: parseFloat(quantity)
        }
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("ERROR UPDATING GLOBAL STOCK:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Lagerbestands" }, { status: 500 })
  }
}