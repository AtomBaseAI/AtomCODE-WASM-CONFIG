"use server";

import { auth, signIn } from "@/auth";
import { LoginSchema } from "@/schemas/auth-schema";
import * as z from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { roleHome } from "@/routes";
import { db } from "@/lib/db";

/**
 * Role-aware login. The unified authorize() already detects which table
 * (admin / staff / student) the email belongs to; here we resolve the
 * role first so each role lands on its own dashboard after sign-in.
 */
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid email/password" };
  }
  const { email, password } = validatedFields.data;

  const findRole = async () => {
    if (await db.admin.findUnique({ where: { email } })) return "admin";
    if (await db.staff.findUnique({ where: { email } })) return "staff";
    if (await db.user.findUnique({ where: { email } })) return "user";
    return null;
  };

  let role: string | null = null;

  try {
    role = await findRole();
    if (!role) return { error: "Invalid Credentials" };

    /**
     * redirect:false — signIn must NOT build the post-login redirect itself.
     * next-auth v5 resolves that redirect against the x-forwarded-host
     * header, which proxied environments can poison with an internal
     * gateway host, sending the browser to a foreign origin after a
     * perfectly valid login (observed live: ws-feed-*.fcapp.run).
     * The session cookie is still set on the action response; we simply
     * navigate ourselves with a relative path below.
     */
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }

  // Must stay OUTSIDE try/catch: redirect() intentionally throws
  // NEXT_REDIRECT. A relative path navigates on the current origin,
  // immune to any forwarded-host poisoning.
  redirect(roleHome(role));
};

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};
