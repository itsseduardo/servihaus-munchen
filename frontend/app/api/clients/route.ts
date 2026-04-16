import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                clientCode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      // REQUISITO JOSÉ: Orden jerárquico doble
      // 1. Primero por Categoría (A, B, C...)
      // 2. Luego por Código de cliente (108, 109, 110...)
      orderBy: [
        { category: "asc" },
        { clientCode: "asc" },
      ],
    })

    return NextResponse.json(clients)

  } catch (error) {
    console.error("CLIENTS GET ERROR:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { clientCode, name, address, email, phone, category, clientType } = body

    if (!clientCode || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      )
    }

    const exists = await prisma.client.findUnique({
      where: { clientCode },
    })

    if (exists) {
      return NextResponse.json(
        { error: "Client code already exists" },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        clientCode,
        name,
        address: address || null,
        email: email || null,
        phone: phone || null,
        //  NUEVOS CAMPOS: Categoría y Tipo (Particular/Empresa)
        category: category || "C",
        clientType: clientType || "PRIVAT", 
      },
    })

    return NextResponse.json(client)

  } catch (error) {
    console.error("CLIENT CREATE ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}