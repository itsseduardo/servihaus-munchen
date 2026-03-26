import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")

  if (!search) {
    return NextResponse.json([])
  }

  const clients = await prisma.client.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    take: 10,
  })

  return NextResponse.json(clients)
}