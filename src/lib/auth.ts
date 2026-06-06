import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    LineProvider({
      clientId: process.env.LINE_LOGIN_CHANNEL_ID || "",
      clientSecret: process.env.LINE_LOGIN_CHANNEL_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      // If signed in with LINE, store LINE userId in user profile if not done
      if (account && account.provider === "line" && user && account.providerAccountId) {
        token.lineUserId = account.providerAccountId;
        // Connect automatically if signed in via LINE Provider
        await prisma.user.update({
          where: { id: user.id },
          data: { lineUserId: account.providerAccountId },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).lineUserId = token.lineUserId || null;
      }
      return session;
    },
  },
};