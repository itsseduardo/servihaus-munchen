import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const codes = await prisma.serviceCode.findMany({
      orderBy: { code: "asc" },
    })

    return NextResponse.json(codes)
  } catch (error) {
    console.error("SERVICE CODES GET ERROR:", error)
    return NextResponse.json([], { status: 500 })
  }
}
