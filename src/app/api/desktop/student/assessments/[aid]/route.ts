import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import {
  sanitizeMcq,
  sanitizeCodeQuestion,
  DESKTOP_ENGINE_LANGUAGES,
  remainingSecondsIST,
} from "@/lib/desktop-helpers";

/**
 * GET /api/desktop/student/assessments/[aid]?uaid=...
 * Questions + state for an in-progress attempt.
 * MCQ correct options stay server-side; hidden code test cases are included
 * only for the languages the desktop client executes with its bundled
 * runtimes (client-side judging) — C/C++/Java stay server-judged via
 * /api/desktop/run.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ aid: string }> }
) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;
  const { aid } = await params;

  const uaid = new URL(req.url).searchParams.get("uaid");
  if (!uaid) return fail(400, "Query parameter 'uaid' is required");

  try {
    const attempt = await db.userAssessmentData.findUnique({
      where: { id: uaid },
      include: {
        assessments: {
          include: { mcqQuestions: true, codeQuestions: true },
        },
      },
    });

    if (!attempt) return fail(404, "Attempt not found");
    if (attempt.userId !== uid) return fail(403, "This attempt belongs to another student");
    if (attempt.assessmentId !== aid)
      return fail(400, "Attempt does not match this assessment");

    const codeRows = await db.userAssessmentCodeData.findMany({
      where: { assessmentId: aid, userId: uid },
      select: { questionId: true, status: true, usercode: true },
    });
    const codeMap = Object.fromEntries(codeRows.map((r) => [r.questionId, r]));

    // remaining time (IST-safe)
    const remainingtime =
      attempt.assessmentstarttime && attempt.maxtime
        ? remainingSecondsIST(attempt.assessmentstarttime, attempt.maxtime)
        : null;

    const assessment = attempt.assessments;

    return json({
      uaid,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        language: assessment.language,
        maxscore: assessment.maxscore,
        maxtime: attempt.maxtime,
      },
      attemptState: {
        status: attempt.status,
        mcqstatus: attempt.mcqstatus,
        questionstatus: attempt.questionstatus,
        usertabswitches: attempt.usertabswitches,
        maxtabswitches: attempt.maxtabswitches,
        remainingtime,
      },
      mcqs: assessment.mcqQuestions.map(sanitizeMcq),
      code: assessment.codeQuestions.map((q) => ({
        ...sanitizeCodeQuestion(q, {
          includeHiddenTests: DESKTOP_ENGINE_LANGUAGES.includes(
            (q.lang ?? "").toLowerCase() as (typeof DESKTOP_ENGINE_LANGUAGES)[number]
          ),
        }),
        questionstatus: codeMap[q.id]?.status === "submitted",
        lastcode: codeMap[q.id]?.usercode ?? null,
      })),
    });
  } catch (e) {
    console.error("[desktop/assessment/detail]", e);
    return fail(500, "Failed to load assessment");
  }
}

export async function OPTIONS() {
  return preflight();
}
