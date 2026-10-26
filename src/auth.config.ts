import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { LoginSchema } from "@/schemas/auth-schema";
import { db } from "@/lib/db";

/**
 * Unified credentials authorize: one login for Admin / Staff / Student.
 * Lookup precedence: admin -> staff -> student(User).
 * Returns a minimal user object; `role` is stamped onto the JWT.
 */
export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const tryLogin = async (
          table: "admin" | "staff" | "user",
          role: "admin" | "staff" | "user"
        ) => {
          const row = await (db[table] as any).findUnique({
            where: { email },
          });
          if (!row) return null;
          const match = await compare(password, row.password);
          if (!match) return null;
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            image: row.image,
            role,
          };
        };

        return (
          (await tryLogin("admin", "admin")) ||
          (await tryLogin("staff", "staff")) ||
          (await tryLogin("user", "user")) ||
          null
        );
      },
    }),
  ],
} satisfies NextAuthConfig;
