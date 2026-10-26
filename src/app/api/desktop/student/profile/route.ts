import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { safeProfile } from "@/lib/desktop-helpers";

/** GET /api/desktop/student/profile — full profile. */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;

  const enrollments = await db.userCourse.count({
    where: { userId: ctx.user.id, active: true },
  });

  return json({ user: safeProfile(ctx.user), activeEnrollments: enrollments });
}

/**
 * PATCH /api/desktop/student/profile — update editable fields.
 * Body: { name?, department?, section?, batch?, rollnumber?, github?, linkedin?, phone? }
 */
export async function PATCH(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;

  const body = await req.json().catch(() => null);
  if (!body) return fail(400, "Invalid JSON body");

  const allowed = [
    "name",
    "department",
    "section",
    "batch",
    "rollnumber",
    "github",
    "linkedin",
    "phone",
  ] as const;

  const data: Record<string, string | null> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) {
      const v = body[field];
      if (v !== null && typeof v !== "string") {
        return fail(400, `Field '${field}' must be a string or null`);
      }
      data[field] = v === "" ? null : v === null ? null : String(v).trim();
    }
  }

  if (Object.keys(data).length === 0) {
    return fail(400, "No editable fields provided");
  }

  try {
    const updated = await db.user.update({
      where: { id: ctx.user.id },
      data,
    });
    return json({ success: true, user: safeProfile(updated) });
  } catch (e) {
    console.error("[desktop/profile PATCH]", e);
    return fail(500, "Failed to update profile");
  }
}

export async function OPTIONS() {
  return preflight();
}
