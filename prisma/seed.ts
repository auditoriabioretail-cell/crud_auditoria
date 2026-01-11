import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const analystPassword = await bcrypt.hash("analyst123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@audit.com" },
    update: {},
    create: {
      email: "admin@audit.com",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@audit.com" },
    update: {},
    create: {
      email: "analyst@audit.com",
      name: "Analista",
      password: analystPassword,
      role: "ANALYST",
    },
  });

  console.log("✅ Users created:", { admin: admin.email, analyst: analyst.email });

  // Create parametric data
  const parametricData = [
    { category: "TIPO_VALIDACION", code: "TV001", value: "Descripcion del Evento Inconsistente", sortOrder: 1 },
    { category: "TIPO_VALIDACION", code: "TV002", value: "Mayor valor en Medicamentos Regulados", sortOrder: 2 },
    { category: "TIPO_VALIDACION", code: "TV003", value: "Codigo Soat no corresponde", sortOrder: 3 },
    { category: "TIPO_VALIDACION", code: "TV004", value: "Codigo Soat no AJUSTADO A Centena", sortOrder: 4 },
    { category: "ESTADO", code: "EST001", value: "Pendiente", sortOrder: 1 },
    { category: "ESTADO", code: "EST002", value: "Revisado", sortOrder: 2 },
    { category: "ESTADO", code: "EST003", value: "Aprobado", sortOrder: 3 },
    { category: "ORIGEN", code: "OR001", value: "FURIPS1", sortOrder: 1 },
    { category: "ORIGEN", code: "OR002", value: "FURIPS 2", sortOrder: 2 },
    { category: "ORIGEN", code: "OR003", value: "Furips2", sortOrder: 3 },
  ];

  for (const item of parametricData) {
    await prisma.parametricTable.upsert({
      where: { category_code: { category: item.category, code: item.code } },
      update: {},
      create: item,
    });
  }

  console.log("✅ Parametric data created");

  // Create sample inconsistencias
  const sampleData = [
    {
      numeroFactura: "CSA64243",
      codigoHabilitacionPrestador: "446500071701",
      ips: "CLINICA SAN JUAN BAUTISTA S.A.S.",
      origen: "FURIPS1",
      tipoValidacion: "Descripcion del Evento Inconsistente",
      observacion: "No se evidencia inconsistencia, servicios debidamente facturados",
      valorTotal: 1104938.00,
      fecha: new Date("2025-12-19"),
      loteCarga: "1955",
      idFacturaFurips1: "355875",
      usuario: "admin",
      aplicaInconsistencia: false,
    },
    {
      numeroFactura: "CSA65391",
      codigoHabilitacionPrestador: "446500071701",
      ips: "CLINICA SAN JUAN BAUTISTA S.A.S.",
      origen: "FURIPS1",
      tipoValidacion: "Descripcion del Evento Inconsistente",
      observacion: "No se evidencia inconsistencia, servicios debidamente facturados",
      valorTotal: 0.00,
      fecha: new Date("2025-12-19"),
      loteCarga: "1955",
      idFacturaFurips1: "355891",
      usuario: "admin",
      aplicaInconsistencia: false,
      observacionAuditor: "test 0720",
    },
    {
      numeroFactura: "CSA65433",
      codigoHabilitacionPrestador: "446500071701",
      ips: "CLINICA SAN JUAN BAUTISTA S.A.S.",
      origen: "Furips2",
      tipoValidacion: "Mayor valor en Medicamentos Regulados",
      observacion: "No se evidencia inconsistencia, servicios debidamente facturados",
      tipoServicio: "1",
      codigoServicio: "20035947-28",
      descripcionServicio: "PRAZED 20MG CÁPSULAS GENERICO INSTITUCIONAL",
      cantidad: 1,
      valorUnitario: 1283.00,
      valorTotal: 1283.00,
      fecha: new Date("2025-12-19"),
      loteCarga: "1955",
      idFacturaFurips1: "1961323",
      usuario: "admin",
      aplicaInconsistencia: false,
    },
    {
      numeroFactura: "CSA63352",
      codigoHabilitacionPrestador: "446500071701",
      ips: "CLINICA SAN JUAN BAUTISTA S.A.S.",
      origen: "FURIPS 2",
      tipoValidacion: "Codigo Soat no corresponde",
      observacion: "El campo codigo no corresponde con un codigo Soat",
      tipoServicio: "2",
      codigoServicio: "902045",
      descripcionServicio: "TIEMPO DE PROTROMBINA TP",
      cantidad: 2,
      valorUnitario: 25000.00,
      valorTotal: 50000.00,
      fecha: new Date("2025-12-19"),
      loteCarga: "1955",
      usuario: "admin",
      aplicaInconsistencia: true,
    },
  ];

  for (const item of sampleData) {
    await prisma.inconsistencia.create({ data: item });
  }

  console.log("✅ Sample inconsistencias created");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
