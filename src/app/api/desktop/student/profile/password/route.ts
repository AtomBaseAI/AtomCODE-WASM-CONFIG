import { db } from "@/lib/db";
import { compare, genSaltSync, hashSync } from "bcrypt-ts";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";

/**
 * POST /api/desktop/student/profile/password
 * Body: { currentPassword, newPassword }  (newPassword >= 6 chars)
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;

  const body = await req.json().catch(() => null);
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    return fail(400, "Current and new passwords are required");
  }
  if (newPassword.length < 6) {
    return fail(400, "New password must be at least 6 characters");
  }

  const match = await compare(currentPassword, ctx.user.password);
  if (!match) return fail(403, "Current password is incorrect");

  try {
    await db.user.update({
      where: { id: ctx.user.id },
      data: { password: hashSync(newPassword, genSaltSync(10)) },
    });
    return json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    console.error("[desktop/password]", e);
    return fail(500, "Failed to update password");
  }
}

export async function OPTIONS() {
  return preflight();
}
