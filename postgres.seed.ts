import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const plainPassword = "Admin@123456";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // create admin user if not exists
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      isVerified: true,
      roles: ["admin", "user"],
      active: true,
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });