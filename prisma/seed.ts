import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const provider = await prisma.provider.upsert({
    where: { slug: "gds-mock" },
    update: {},
    create: {
      name: "GDS Mock (SOAP)",
      slug: "gds-mock",
      integrationType: "SOAP",
      active: true,
      lastHealthStatus: "UP",
      lastHealthAt: new Date(),
    },
  });

  await prisma.booking.upsert({
    where: { reference: "BK-DEMO0001" },
    update: {},
    create: {
      reference: "BK-DEMO0001",
      travelerName: "Kaique Rocha",
      destination: "Belo Horizonte",
      checkIn: new Date("2026-09-01T15:00:00Z"),
      checkOut: new Date("2026-09-04T11:00:00Z"),
      amountCents: 89000,
      currency: "BRL",
      status: "PENDING",
      providerId: provider.id,
    },
  });

  console.log("Seed completed");
}

main()
  .finally(() => prisma.$disconnect());
