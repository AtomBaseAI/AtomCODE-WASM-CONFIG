import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolledInModule, ensureUserModuleData } from "@/lib/desktop-helpers";

/**
 * POST /api/desktop/student/practice/module
 * Module lifecycle tracking for the desktop client.
 * Body: { moduleId, action: "start" | "submit" }
 *   start  → creates the tracking row (modulestatus: "active")
 *   submit → finalizes the module   (modulestatus: "submitted")
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  const body = await req.json().catch(() => null);
  const moduleId = String(body?.moduleId ?? "");
  const action = String(body?.action ?? "");

  const { ok, module: mod } = await isEnrolledInModule(uid, moduleId);
  if (!mod) return fail(404, "Module not found");
  if (!ok) return fail(403, "You are not enrolled in this module's course");

  try {
    const umd = await ensureUserModuleData(uid, mod.courseId, moduleId);

    if (action === "start") {
      return json({ success: true, umid: umd.id, modulestatus: umd.modulestatus });
    }

    if (action === "submit") {
      await db.userModuleData.update({
        where: { id: umd.id },
        data: { modulestatus: "submitted" },
      });
      return json({ success: true, message: "Module submitted!", umid: umd.id });
    }

    return fail(400, "Unknown action — use 'start' or 'submit'");
  } catch (e) {
    console.error("[desktop/practice/module]", e);
    return fail(500, "Failed to update module tracking");
  }
}

export async function OPTIONS() {
  return preflight();
}
