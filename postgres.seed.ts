import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const plainPassword = "Admin@123456";
  const username = "admin";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // create admin user if not exists
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      username,
      isVerified: true,
      roles: ["admin", "user"],
      active: true,
    },
  });

  console.log("Admin created:", admin.email);

  // -----------------------------
  // AUTH SETTINGS (GLOBAL)
  // -----------------------------
  const authSettings = await prisma.authSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      password: true,
      passkeys: true,
      emailPasscode: true,
      mobile: true,
    },
  });

  console.log("Auth settings initialized:", authSettings);

  // -----------------------------
  // MFA SETTINGS (GLOBAL)
  // -----------------------------
  const mfaSettings = await prisma.mfaSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      totp: true,
      email: true,
      sms: true,
    },
  });

  console.log("MFA settings initialized:", mfaSettings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
