import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Presupuesto" },
      update: {},
      create: {
        name: "Presupuesto",
        description: "Documentos relacionados con presupuestos públicos",
      },
    }),
    prisma.category.upsert({
      where: { name: "Contratos" },
      update: {},
      create: {
        name: "Contratos",
        description: "Contratos y licitaciones públicas",
      },
    }),
    prisma.category.upsert({
      where: { name: "Normatividad" },
      update: {},
      create: {
        name: "Normatividad",
        description: "Leyes, decretos y reglamentos",
      },
    }),
    prisma.category.upsert({
      where: { name: "Informes" },
      update: {},
      create: {
        name: "Informes",
        description: "Informes de gestión y rendición de cuentas",
      },
    }),
  ]);

  console.log("Categorías creadas:", categories.length);

  // Crear documentos de ejemplo
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        title: "Presupuesto General 2024",
        description: "Presupuesto general de la entidad para el año 2024",
        category: "Presupuesto",
        fileType: "PDF",
        fileSize: 2048000,
        isPublic: true,
      },
    }),
    prisma.document.create({
      data: {
        title: "Contrato de Obras Públicas #001",
        description: "Contrato para la construcción de infraestructura vial",
        category: "Contratos",
        fileType: "PDF",
        fileSize: 1024000,
        isPublic: true,
      },
    }),
    prisma.document.create({
      data: {
        title: "Decreto de Transparencia",
        description:
          "Decreto que regula la transparencia y acceso a la información",
        category: "Normatividad",
        fileType: "PDF",
        fileSize: 512000,
        isPublic: true,
      },
    }),
    prisma.document.create({
      data: {
        title: "Informe de Gestión Q1 2024",
        description: "Informe trimestral de gestión del primer trimestre 2024",
        category: "Informes",
        fileType: "PDF",
        fileSize: 3072000,
        isPublic: true,
      },
    }),
  ]);

  console.log("Documentos creados:", documents.length);

  // Crear usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@transparencia.gov.co" },
    update: {},
    create: {
      email: "admin@transparencia.gov.co",
      name: "Administrador del Sistema",
      role: "ADMIN",
    },
  });

  console.log("Usuario administrador creado:", adminUser.email);
  console.log("Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
