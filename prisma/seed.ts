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
        status: "PLANNING",
        clientId: "1", // Assuming this is the ID of the first client created above
      },
      {
        name: "Aktivt Projekt",
        description: "Dette er et aktivt projekt",
        status: "ACTIVE",
        clientId: "2", // Assuming this is the ID of the second client created above
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