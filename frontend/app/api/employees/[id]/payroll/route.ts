import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 1. Cambiamos el tipo de params a Promise
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 2. Esperamos a que los params se resuelvan
    const resolvedParams = await params;
    const employeeId = parseInt(resolvedParams.id);
    
    const body = await req.json();

    // Verificamos si ya existe un registro para ese mes y año
    const existing = await prisma.payrollRecord.findFirst({
      where: { 
        employeeId, 
        month: parseInt(body.month), 
        year: parseInt(body.year) 
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un registro para este mes y año." },
        { status: 400 }
      );
    }

    const record = await prisma.payrollRecord.create({
      data: {
        employeeId,
        month: parseInt(body.month),
        year: parseInt(body.year),
        workedHours: parseFloat(body.workedHours),
        brutto: parseFloat(body.brutto),
        svAbzuege: parseFloat(body.svAbzuege),
        steuerAbzuege: parseFloat(body.steuerAbzuege),
        netto: parseFloat(body.netto),
        totalCost: parseFloat(body.totalCost),
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error saving payroll:", error);
    return NextResponse.json({ error: "Error al guardar los datos" }, { status: 500 });
  }
}