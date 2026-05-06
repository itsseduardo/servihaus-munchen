// frontend/app/api/clients/route.ts

import { NextResponse } from "next/server"

import { requireApiRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const authError = await requireApiRole(["ADMIN"])
  if (authError) return authError

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
      orderBy: [
        { category: "asc" },
        { clientCode: "asc" },
      ],
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("CLIENTS GET ERROR:", error)
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const authError = await requireApiRole(["ADMIN"])
  if (authError) return authError

  try {
    const body = await req.json()
    const {
      clientCode,
      name,
      address,
      email,
      phone,
      category,
      clientType,
    } = body

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