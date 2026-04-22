import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clientId, deliveryCode, date, items } = body

    if (!clientId || !deliveryCode || !items || items.length === 0) {
      return NextResponse.json({ error: "Faltan datos en el albarán (SAMP)" }, { status: 400 })
    }

    // Transacción: O se hace todo perfecto, o no se guarda nada
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Guardar el registro oficial del documento SAMP
      const deliveryLog = await tx.deliveryLog.create({
        data: {
          deliveryCode,
          clientId: parseInt(clientId),
          date: new Date(date),
          items: items 
        }
      })

      // 2. Lógica de traspaso de inventario
      for (const item of items) {
        const productId = parseInt(item.productId)
        const qty = parseFloat(item.quantity)

        // A. QUITAR DEL ALMACÉN CENTRAL (Servihaus)
        const product = await tx.product.findUnique({ where: { id: productId } })
        if (product) {
          await tx.product.update({
            where: { id: productId },
            // Restamos la cantidad que acabamos de subir a la furgoneta
            data: { globalStock: product.globalStock - qty } 
          })
        }

        // B. PONER EN LA DESPENSA DEL CLIENTE
        const existing = await tx.clientInventory.findFirst({
          where: { clientId: parseInt(clientId), productId }
        })

        if (existing) {
          // Si ya tenía, le sumamos
          await tx.clientInventory.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + qty }
          })
        } else {
          // Si es un producto nuevo para este cliente, lo creamos
          await tx.clientInventory.create({
            data: {
              clientId: parseInt(clientId),
              productId,
              quantity: qty
            }
          })
        }
      }

      return deliveryLog
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("DELIVERY POST ERROR:", error)
    return NextResponse.json({ error: "Error al registrar el documento SAMP" }, { status: 500 })
  }
}