import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { clientId, items } = await req.json()
    // items será un array: [{ productId: 1, quantity: 2 }, ...]

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json({ error: "Fehlende Daten" }, { status: 400 })
    }

    // Usamos una transacción para procesar todos los materiales de forma segura
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const inventory = await tx.clientInventory.findFirst({
          where: { 
            clientId: parseInt(clientId), 
            productId: parseInt(item.productId) 
          }
        })

        if (inventory) {
          // Restamos la cantidad consumida
          await tx.clientInventory.update({
            where: { id: inventory.id },
            data: { 
              // Evitamos que baje de 0 por error
              quantity: Math.max(0, inventory.quantity - parseFloat(item.quantity)) 
            }
          })
        }
      }
      return { success: true }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("ERROR CONSUMING INVENTORY:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Inventars" }, { status: 500 })
  }
}