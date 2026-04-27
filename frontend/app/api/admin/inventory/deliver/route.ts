import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clientInventoryId, productId, quantityDelivered } = await req.json()

    if (!clientInventoryId || !productId || !quantityDelivered || quantityDelivered <= 0) {
      return NextResponse.json({ error: "Datos de entrega inválidos" }, { status: 400 })
    }

    // Usamos una transacción para que todo ocurra al mismo tiempo y sin errores
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Restar la cantidad física de la Bodega Central
      const updatedProduct = await tx.product.update({
        where: { id: parseInt(productId) },
        data: { 
          globalStock: { decrement: parseFloat(quantityDelivered) } 
        }
      })

      // Seguro de stock: Evita que José entregue algo que no tiene en sistema
      if (updatedProduct.globalStock < 0) {
        throw new Error("Nicht genug Bestand im Zentrallager (Stock insuficiente en Bodega Central)")
      }

      // 2. Restaurar la "Alerta" del cliente a estado Normal (1 = Tiene producto)
      const updatedClientInv = await tx.clientInventory.update({
        where: { id: parseInt(clientInventoryId) },
        data: { quantity: 1 } 
      })

      // 3. Dejar huella en el libro contable para el futuro PDF de consumos
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: parseInt(productId),
          type: 'OUT',
          quantity: parseFloat(quantityDelivered),
          notes: `Lieferung an Kunden (Entrega a cliente ref: ${clientInventoryId})`
        }
      })

      return { updatedProduct, updatedClientInv, movement }
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    console.error("DELIVERY ERROR:", error)
    return NextResponse.json(
      { error: error.message || "Fehler bei der Lieferung (Error en el despacho)" }, 
      { status: 500 }
    )
  }
}