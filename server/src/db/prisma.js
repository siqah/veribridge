import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma Client
// This ensures we only create one instance across the entire application
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  });
} else {
  // In development, use global to prevent hot-reload from creating new instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // Reduced logging for better performance - enable ["query"] only when debugging
      log: ["warn", "error"],
    });
  }
  prisma = global.prisma;
}

// Log successful connection
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully (PostgreSQL via Prisma)");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("🔌 Database disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("🔌 Database disconnected");
  process.exit(0);
});

export default prisma;
