import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { safeProfile } from "@/lib/desktop-helpers";

/**
 * GET /api/desktop/auth/me — current student profile (Bearer token).
 */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  return json({ user: safeProfile(ctx.user) });
}

export async function OPTIONS() {
  return preflight();
}
