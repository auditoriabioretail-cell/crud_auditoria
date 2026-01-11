import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await prisma.parametricTable.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching parametricas:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = await prisma.parametricTable.create({ data: body });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating parametrica:", error);
    return NextResponse.json({ error: "Error al crear registro" }, { status: 500 });
  }
}
