import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { getAssessmentsByUserId } from "@/data/student/assessments";

/**
 * GET /api/desktop/student/assessments — assessments across the student's
 * active courses with dynamic status (start / resume / retake / upcoming / expired).
 */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;

  try {
    const assessments = await getAssessmentsByUserId(ctx.user.id);
    return json({ assessments });
  } catch (e) {
    console.error("[desktop/assessments]", e);
    return fail(500, "Failed to load assessments");
  }
}

export async function OPTIONS() {
  return preflight();
}
