import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function parsePositiveOrZero(value: unknown, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return null
  }

  return number
}

//
// GET PRODUCT CATALOG
//
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("PRODUCTS GET ERROR:", error)

    return NextResponse.json(
      { error: "Error al cargar el catálogo de productos" },
      { status: 500 }
    )
  }
}

//
// CREATE PRODUCT IN MASTER CATALOG
//
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : ""

    const unit =
      typeof body.unit === "string"
        ? body.unit.trim()
        : ""

    const globalStock = parsePositiveOrZero(body.globalStock, 0)
    const minStock = parsePositiveOrZero(body.minStock, 1)

    if (!name) {
      return NextResponse.json(
        { error: "El nombre del producto es obligatorio." },
        { status: 400 }
      )
    }

    if (!unit) {
      return NextResponse.json(
        { error: "La unidad del producto es obligatoria." },
        { status: 400 }
      )
    }

    if (globalStock === null) {
      return NextResponse.json(
        { error: "El stock central debe ser una cantidad válida." },
        { status: 400 }
      )
    }

    if (minStock === null) {
      return NextResponse.json(
        { error: "El stock mínimo debe ser una cantidad válida." },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese nombre." },
        { status: 409 }
      )
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        unit,
        globalStock,
        minStock,
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("PRODUCTS POST ERROR:", error)

    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    )
  }
}