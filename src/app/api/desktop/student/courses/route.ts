import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { getAllUserCourses } from "@/data/student/courses";

/**
 * GET /api/desktop/student/courses — enrolled courses with progress.
 */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;

  try {
    const courses = await getAllUserCourses(ctx.user.id);
    return json({ courses });
  } catch (e) {
    console.error("[desktop/courses]", e);
    return fail(500, "Failed to load courses");
  }
}

export async function OPTIONS() {
  return preflight();
}
