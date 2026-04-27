import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  try {
    // 1. Verificación de seguridad
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Extraer datos del formulario que enviará José
    const body = await req.json()
    const { productId, quantity, provider, costPerUnit, notes } = body

    // 3. Validación básica
    if (!productId || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Producto y cantidad mayor a 0 son obligatorios" }, 
        { status: 400 }
      )
    }

    // 4. Ejecutar la Transacción (Todo o nada)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Sumar al Stock Global de ServiHaus
      const updatedProduct = await tx.product.update({
        where: { id: parseInt(productId) },
        data: {
          globalStock: {
            increment: parseFloat(quantity)
          }
        }
      })

      // B. Guardar el "Recibo" histórico de la compra
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: parseInt(productId),
          type: 'IN', // Es una entrada
          quantity: parseFloat(quantity),
          costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
          provider: provider || null,
          notes: notes || "Ingreso a bodega central"
        }
      })

      return { updatedProduct, movement }
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error("INBOUND INVENTORY ERROR:", error)
    return NextResponse.json(
      { error: "Error al registrar el ingreso de mercancía" }, 
      { status: 500 }
    )
  }
}