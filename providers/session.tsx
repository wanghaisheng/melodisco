"use client";

import { SessionProvider } from "next-auth/react";
export const runtime = 'edge'

export function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
