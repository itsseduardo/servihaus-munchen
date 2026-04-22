import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Traemos todo el inventario físico que hay en los clientes
    const inventories = await prisma.clientInventory.findMany({
      include: {
        client: true,
        product: true,
      },
      orderBy: { client: { name: 'asc' } }
    })

    //  Filtramos lo que está en stock crítico
    const alerts = inventories.filter(inv => inv.quantity <= inv.product.minStock)

    // Agrupamos el inventario por cliente para que sea fácil de pintar en tablas
    const byClient = inventories.reduce((acc, curr) => {
      if (!acc[curr.clientId]) {
        acc[curr.clientId] = {
          client: curr.client,
          items: []
        }
      }
      acc[curr.clientId].items.push(curr)
      return acc
    }, {} as Record<number, any>)

    return NextResponse.json({
      alerts,
      inventoryByClient: Object.values(byClient)
    })

  } catch (error) {
    console.error("INVENTORY GET ERROR:", error)
    return NextResponse.json({ error: "Error al cargar inventario" }, { status: 500 })
  }
}