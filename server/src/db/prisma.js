import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma Client with connection pooling
// This ensures we only create one instance across the entire application
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    // Connection pool settings for production
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, use global to prevent hot-reload from creating new instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
      // Connection pool settings for development
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
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
