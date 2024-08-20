import { User } from "@/types/user";
import { getDb } from "@/models/db";
import { auth } from "@/configs/auth";

export const runtime = 'edge';

export async function saveUser(user: User) {
  const prisma = getDb();
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          uuid: user.uuid, // Assuming uuid is used as the id
          email: user.email,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          // Add other fields as necessary
        },
      });
    } else {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          uuid: user.uuid,

          // Update other fields as necessary
        },
      });
      user.id = existingUser.id;
      // user.uuid = existingUser.id; // Assuming id is used as uuid
      user.created_at = existingUser.emailVerified?.toISOString() || user.created_at;
    }
  } catch (e) {
    console.log("save user failed: ", e);
  }
}

export async function getUserId() {
  const session = await auth();
  return session?.user?.id || "";
}
export async function getUserUuid(): Promise<string> {
  const email = await getUserEmail();
  const prisma = getDb();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { uuid: true }
  });
  return user?.uuid || "";
}

export async function getUserEmail() {
  const session = await auth();
  console.log("session", session);
  return session?.user?.email || "";
}