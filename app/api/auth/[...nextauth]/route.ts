import NextAuth from "next-auth";
import { authOptions } from "@/configs/auth";
export const runtime = "edge";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
