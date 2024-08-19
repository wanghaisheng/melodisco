import { genUniSeq, getIsoTimestr } from "@/utils";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { User } from "@/types/user";
import { saveUser } from "@/services/user";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "google-one-tap",
      name: "google-one-tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId || !credentials?.credential) {
          console.log("invalid google auth config");
          return null;
        }

        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credentials.credential}`);
        const payload = await response.json();

        if (!payload || payload.error) {
          console.log("invalid payload from token");
          return null;
        }

        const { email, sub, given_name, family_name, email_verified, picture: image } = payload;
        if (!email) {
          console.log("invalid email in payload");
          return null;
        }

        return {
          id: sub,
          name: [given_name, family_name].join(" "),
          email,
          image,
          emailVerified: email_verified ? new Date().toISOString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && user.email && account) {
        const dbUser: User = {
          uuid: genUniSeq(),
          email: user.email,
          nickname: user.name || "",
          avatar_url: user.image || "",
          signin_type: account.type,
          signin_provider: account.provider,
          signin_openid: account.providerAccountId,
          created_at: getIsoTimestr(),
          signin_ip: "",
        };
        await saveUser(dbUser);

        console.log("save user", dbUser);
        token.user = {
          uuid: dbUser.uuid,
          nickname: dbUser.nickname,
          email: dbUser.email,
          avatar_url: dbUser.avatar_url,
          created_at: dbUser.created_at,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
});

export const runtime = "edge";