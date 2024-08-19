import { User } from "@/types/user";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";

export async function insertUser(user: User) {
  const prisma = getDb();
  return prisma.users.create({
    data: formatUserForPrisma(user),
  });
}

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const prisma = getDb();
  const user = await prisma.users.findUnique({
    where: { email },
  });
  return user ? formatUser(user) : undefined;
}

export async function findUserByUuid(uuid: string): Promise<User | undefined> {
  const prisma = getDb();
  const user = await prisma.users.findUnique({
    where: { uuid },
  });
  return user ? formatUser(user) : undefined;
}

function formatUserForPrisma(user: User): Prisma.usersCreateInput {
  return {
    uuid: user.uuid,
    email: user.email,
    created_at: user.created_at || new Date(),
    nickname: user.nickname,
    avatar_url: user.avatar_url,
    locale: user.locale || "",
    signin_type: user.signin_type || "",
    signin_ip: user.signin_ip || "",
    signin_provider: user.signin_provider || "",
    signin_openid: user.signin_openid || "",
  };
}

function formatUser(row: Prisma.usersCreateInput): User {
  return {
    uuid: row.uuid,
    email: row.email,
    created_at: row.created_at,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    locale: row.locale,
    signin_type: row.signin_type,
    signin_ip: row.signin_ip,
    signin_provider: row.signin_provider,
    signin_openid: row.signin_openid,
  };
}