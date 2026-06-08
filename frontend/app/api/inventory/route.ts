import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function getLastUpdated(item: any) {
  return item.updatedAt || item.lastUpdated || item.createdAt || null
}

export async function GET() {
  try {
    const [clients, inventories] = await Promise.all([
      prisma.client.findMany({
        orderBy: {
          name: "asc",
        },
      }),

      prisma.clientInventory.findMany({
        include: {
          client: true,
          product: true,
        },
        orderBy: [
          {
            client: {
              name: "asc",
            },
          },
          {
            product: {
              name: "asc",
            },
          },
        ],
      }),
    ])

    const normalizedInventories = inventories.map((item: any) => {
      const quantity = getNumber(item.quantity)
      const minStock = getNumber(item.product?.minStock)

      return {
        ...item,
        quantity,
        minStock,
        lastUpdated: getLastUpdated(item),
        status:
          quantity <= 0
            ? "EMPTY"
            : quantity <= minStock
              ? "LOW"
              : "OK",
      }
    })

    const alerts = normalizedInventories.filter((item) => {
      return item.quantity <= item.minStock
    })

    const inventoryMap = normalizedInventories.reduce<Record<number, any[]>>(
      (acc, item) => {
        if (!acc[item.clientId]) {
          acc[item.clientId] = []
        }

        acc[item.clientId].push(item)

        return acc
      },
      {}
    )

    const inventoryByClient = clients.map((client) => ({
      client,
      items: inventoryMap[client.id] || [],
    }))

    return NextResponse.json({
      alerts,
      inventoryByClient,
      summary: {
        totalClients: clients.length,
        totalInventoryItems: normalizedInventories.length,
        clientsWithInventory: inventoryByClient.filter(
          (entry) => entry.items.length > 0
        ).length,
        clientsWithoutInventory: inventoryByClient.filter(
          (entry) => entry.items.length === 0
        ).length,
        alerts: alerts.length,
      },
    })
  } catch (error) {
    console.error("INVENTORY GET ERROR:", error)

    return NextResponse.json(
      { error: "Error al cargar inventario" },
      { status: 500 }
    )
  }
}