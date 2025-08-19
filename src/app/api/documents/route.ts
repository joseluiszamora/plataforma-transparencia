import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los documentos
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo documento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, fileUrl, fileType, fileSize } = body;

    const document = await prisma.document.create({
      data: {
        title,
        description,
        category,
        fileUrl,
        fileType,
        fileSize,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error al crear documento:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    );
  }
}
