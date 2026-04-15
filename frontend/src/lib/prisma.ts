import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as { prisma: any };
const databaseUrl = process.env.DATABASE_URL || "";
const shouldUseAccelerate =
  databaseUrl.startsWith("prisma://") ||
  databaseUrl.startsWith("prisma+postgres://");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

function createPrismaClient() {
  const prismaClient = shouldUseAccelerate
    ? new PrismaClient({ accelerateUrl: databaseUrl })
    : new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl }),
      });
  return (shouldUseAccelerate
    ? prismaClient.$extends(withAccelerate())
    : prismaClient) as unknown as PrismaClient;
}

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
