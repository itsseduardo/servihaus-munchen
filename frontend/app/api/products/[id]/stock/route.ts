import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { quantity } = await req.json()
    const productId = parseInt(params.id)

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