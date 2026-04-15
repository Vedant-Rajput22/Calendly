import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const databaseUrl = process.env.DATABASE_URL || "";
const shouldUseAccelerate =
  databaseUrl.startsWith("prisma://") ||
  databaseUrl.startsWith("prisma+postgres://");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const prismaClient = shouldUseAccelerate
  ? new PrismaClient({ accelerateUrl: databaseUrl })
  : new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
const prisma = (shouldUseAccelerate
  ? prismaClient.$extends(withAccelerate())
  : prismaClient) as unknown as PrismaClient;

export default prisma;
