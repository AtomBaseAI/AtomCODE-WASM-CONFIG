"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  /**
   * redirect:false — same poisoned x-forwarded-host issue as login:
   * next-auth v5 would redirect(res.redirect) to a foreign origin
   * behind the preview proxy. Clear the session cookies, then navigate
   * with a relative path ourselves.
   */
  await signOut({ redirect: false });
  redirect("/login");
};
