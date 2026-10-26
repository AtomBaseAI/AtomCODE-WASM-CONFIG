import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "staff" | "user";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "staff" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "staff" | "user";
  }
}
