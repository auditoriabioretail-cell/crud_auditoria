import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar inconsistencias con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const tipoValidacion = searchParams.get("tipoValidacion") || "";
    const aplicaInconsistencia = searchParams.get("aplicaInconsistencia");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { numeroFactura: { contains: search, mode: "insensitive" } },
        { ips: { contains: search, mode: "insensitive" } },
        { descripcionServicio: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tipoValidacion) {
      where.tipoValidacion = tipoValidacion;
    }

    if (aplicaInconsistencia !== null && aplicaInconsistencia !== "") {
      where.aplicaInconsistencia = aplicaInconsistencia === "true";
    }

    const [data, total] = await Promise.all([
      prisma.inconsistencia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.inconsistencia.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inconsistencias:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva inconsistencia
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    
    const inconsistencia = await prisma.inconsistencia.create({
      data: body,
    });

    return NextResponse.json(inconsistencia, { status: 201 });
  } catch (error) {
    console.error("Error creating inconsistencia:", error);
    return NextResponse.json(
      { error: "Error al crear el registro" },
      { status: 500 }
    );
  }
}
