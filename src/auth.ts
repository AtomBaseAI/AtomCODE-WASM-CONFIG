import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { AUTH_SECRET_FALLBACK } from "@/lib/auth-secret";

/**
 * Session signing secret: AUTH_SECRET when present, sandbox fallback
 * otherwise (see src/lib/auth-secret.ts for why).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || AUTH_SECRET_FALLBACK,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },
    async session({ token, session }) {
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.role && session.user) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  ...authConfig,
});
