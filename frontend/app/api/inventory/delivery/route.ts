import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function parsePositiveNumber(value: unknown) {
  const number = Number(value)

  if (!Number.isFinite(number) || number <= 0) {
    return null
  }

  return number
}

function buildInternalReference() {
  const now = new Date()

  const datePart = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")

  const timePart = now
    .toISOString()
    .slice(11, 19)
    .replace(/:/g, "")

  return `LIEFERUNG-${datePart}-${timePart}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const clientInventoryId = Number(body.clientInventoryId)
    const productId = Number(body.productId)
    const quantityDelivered = parsePositiveNumber(body.quantityDelivered)

    const reference =
      typeof body.reference === "string" && body.reference.trim()
        ? body.reference.trim()
        : typeof body.deliveryCode === "string" && body.deliveryCode.trim()
          ? body.deliveryCode.trim()
          : buildInternalReference()

    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : "Schnelle Materiallieferung aus Bestandswarnung."

    if (!Number.isInteger(clientInventoryId)) {
      return NextResponse.json(
        { error: "Ungültige Inventarposition." },
        { status: 400 }
      )
    }

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Ungültiges Produkt." },
        { status: 400 }
      )
    }

    if (!quantityDelivered) {
      return NextResponse.json(
        { error: "Bitte geben Sie eine gültige Liefermenge ein." },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const clientInventory = await tx.clientInventory.findUnique({
        where: {
          id: clientInventoryId,
        },
        include: {
          client: true,
          product: true,
        },
      })

      if (!clientInventory) {
        throw new Error("CLIENT_INVENTORY_NOT_FOUND")
      }

      if (clientInventory.productId !== productId) {
        throw new Error("PRODUCT_MISMATCH")
      }

      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      })

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND")
      }

      const currentGlobalStock = Number(product.globalStock || 0)
      const nextGlobalStock = currentGlobalStock - quantityDelivered

      if (nextGlobalStock < 0) {
        throw new Error(`INSUFFICIENT_STOCK:${product.name}`)
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          globalStock: nextGlobalStock,
        },
      })

      const updatedClientInventory = await tx.clientInventory.update({
        where: {
          id: clientInventoryId,
        },
        data: {
          quantity: Number(clientInventory.quantity || 0) + quantityDelivered,
        },
        include: {
          client: true,
          product: true,
        },
      })

      const deliveryLog = await tx.deliveryLog.create({
        data: {
          clientId: clientInventory.clientId,
          deliveryCode: reference,
          date: new Date(),
          items: [
            {
              productId,
              quantity: quantityDelivered,
            },
          ],
          notes,
        },
      })

      return {
        success: true,
        deliveryLog,
        product: updatedProduct,
        clientInventory: updatedClientInventory,
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("ADMIN INVENTORY DELIVER ERROR:", error)

    if (error instanceof Error) {
      if (error.message === "CLIENT_INVENTORY_NOT_FOUND") {
        return NextResponse.json(
          { error: "Die Inventarposition wurde nicht gefunden." },
          { status: 404 }
        )
      }

      if (error.message === "PRODUCT_MISMATCH") {
        return NextResponse.json(
          { error: "Das Produkt passt nicht zur Inventarposition." },
          { status: 400 }
        )
      }

      if (error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Das Produkt wurde nicht gefunden." },
          { status: 404 }
        )
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = error.message.replace("INSUFFICIENT_STOCK:", "")

        return NextResponse.json(
          {
            error: `Nicht genug Bestand im Zentrallager für "${productName}".`,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Materiallieferung konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }
}