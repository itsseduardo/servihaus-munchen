import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: Obtener todo el catálogo ordenado alfabéticamente
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error("PRODUCTS GET ERROR:", error)
    return NextResponse.json({ error: "Error al cargar el catálogo de productos" }, { status: 500 })
  }
}

// POST: Crear un nuevo producto en el catálogo base
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, unit, minStock } = body

    if (!name || !unit) {
      return NextResponse.json({ error: "Nombre y unidad son obligatorios" }, { status: 400 })
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        unit,
        minStock: minStock ? parseFloat(minStock) : 1
      }
    })

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error("PRODUCTS POST ERROR:", error)
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 })
  }
}