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


  const usersData = [
    {
      email: "alice.johnson@example.com",
      username: "alice",
      password: "Password123!",
      firstName: "Alice",
      lastName: "Johnson",
      roles: ["user"],
    },
    {
      email: "bob.smith@example.com",
      username: "bob",
      password: "Password123!",
      firstName: "Bob",
      lastName: "Smith",
      roles: ["user"],
    },
    {
      email: "charlie.brown@example.com",
      username: "charlie",
      password: "Password123!",
      firstName: "Charlie",
      lastName: "Brown",
      roles: ["user"],
    },
    {
      email: "diana.miller@example.com",
      username: "diana",
      password: "Password123!",
      firstName: "Diana",
      lastName: "Miller",
      roles: ["user"],
    },
    {
      email: "ethan.wilson@example.com",
      username: "ethan",
      password: "Password123!",
      firstName: "Ethan",
      lastName: "Wilson",
      roles: ["user"],
    },
  ];

  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        password: hashed,
        firstName: u.firstName,
        lastName: u.lastName,
        isVerified: true,
        roles: u.roles,
      },
    });


  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
