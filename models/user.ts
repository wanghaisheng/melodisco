import { User } from "@/types/user";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";

export async function insertUser(user: User) {
  const prisma = getDb();
  return prisma.user.create({
    data: {
      uuid: user.uuid,
      email: user.email,
      created_at: (user.created_at as any)?.toISOString?.() || user.created_at || new Date().toISOString(),
      nickname: user.nickname || null,
      avatar_url: user.avatar_url || null,
      locale: user.locale || null,
      signin_type: user.signin_type || null,
      signin_ip: user.signin_ip || null,
      signin_provider: user.signin_provider || null,
      signin_openid: user.signin_openid || null,
    },
  });
}

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const prisma = getDb();
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user ? formatUser(user) : undefined;
}

export async function findUserByUuid(uuid: string): Promise<User | undefined> {
  const prisma = getDb();
  const user = await prisma.user.findUnique({
    where: { uuid },
  });
  return user ? formatUser(user) : undefined;
}

function formatUser(row: any): User {
  return {
    uuid: row.uuid,
    email: row.email,
    created_at: row.created_at instanceof Date 
      ? row.created_at.toISOString() 
      : row.created_at || new Date().toISOString(),
    nickname: row.nickname || "",
    avatar_url: row.avatar_url || "",
    locale: row.locale || undefined,
    signin_type: row.signin_type || undefined,
    signin_ip: row.signin_ip || undefined,
    signin_provider: row.signin_provider || undefined,
    signin_openid: row.signin_openid || undefined,
  };
}