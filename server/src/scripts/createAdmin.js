import prisma from "../db/prisma.js";
import bcrypt from "bcryptjs";

/**
 * Script to create or update admin user
 * Email: faruoqmuhammed@gmail.com
 * Password: sika
 */

async function createAdminUser() {
  try {
    const email = "faruoqmuhammed@gmail.com";
    const password = "sika";
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        emailVerified: true,
      },
      create: {
        email,
        passwordHash,
        fullName: "Admin User",
        emailVerified: true,
      },
    });

    console.log("✅ Admin user created/updated successfully:");
    console.log("   Email:", email);
    console.log("   Password: sika");
    console.log("   User ID:", admin.id);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
