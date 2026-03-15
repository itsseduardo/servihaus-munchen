import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const clients = await prisma.client.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
      select: {
        id: true,
        name: true,
        clientCode: true,
        address: true,
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("CLIENTS GET ERROR:", error)
    return NextResponse.json([], { status: 200 })
  }
}