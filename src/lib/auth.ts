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
    async signIn({ user, account }) {
      // If logging in via LINE provider
      if (account && account.provider === "line" && account.providerAccountId) {
        // Find if another user is already using this LINE ID
        const existingLineUser = await prisma.user.findUnique({
          where: { lineUserId: account.providerAccountId },
        });

        // If a different user already linked this LINE ID, block or allow? Usually block/unlink first.
        // But if current user is logged in (NextAuth doesn't easily pass current session to signIn callback directly,
        // but since we are using next-auth 4, we can handle account linking via route/redirect easier, or handle in jwt).
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      // If signed in with LINE, store LINE userId in user profile if not done
      if (account && account.provider === "line" && account.providerAccountId) {
        token.lineUserId = account.providerAccountId;
        
        // Handle linking if user is already logged in (token.id exists)
        const targetUserId = (token.id || user?.id) as string | undefined;
        if (targetUserId) {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { lineUserId: account.providerAccountId },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        // Fetch fresh lineUserId from database to ensure settings UI is updated dynamically
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { lineUserId: true },
        });
        (session.user as any).lineUserId = dbUser?.lineUserId || null;
      }
      return session;
    },
  },
};