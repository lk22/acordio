import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.client.createMany({
    data: [
      {
        name: "Test Kunde",
        email: "test@example.com",
        phone: "12345678",
        status: "LEAD",
        notes: "Dette er en test kunde",
      },
      {
        name: "Aktiv Kunde",
        email: "aktiv@example.com",
        status: "ACTIVE",
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        name: "Test Projekt",
        description: "Dette er et test projekt",
        type: "PROJECT",
        clientId: "1",
      },
      {
        name: "Aktivt Projekt",
        description: "Dette er et aktivt projekt",
        type: "SUPPORT",
        clientId: "2",
      }
    ],
  });

  console.log("✅ Database seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });