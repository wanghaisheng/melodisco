import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

let prisma: PrismaClient;

export function getDb() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export const adapter = PrismaAdapter(getDb());