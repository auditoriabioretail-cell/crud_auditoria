import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Obtener una inconsistencia
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const inconsistencia = await prisma.inconsistencia.findUnique({
      where: { id: parseInt(id) },
    });

    if (!inconsistencia) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(inconsistencia);
  } catch (error) {
    console.error("Error fetching inconsistencia:", error);
    return NextResponse.json(
      { error: "Error al obtener el registro" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar inconsistencia (con auto-save)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const inconsistencia = await prisma.inconsistencia.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(inconsistencia);
  } catch (error) {
    console.error("Error updating inconsistencia:", error);
    return NextResponse.json(
      { error: "Error al actualizar el registro" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar inconsistencia (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.inconsistencia.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inconsistencia:", error);
    return NextResponse.json(
      { error: "Error al eliminar el registro" },
      { status: 500 }
    );
  }
}
