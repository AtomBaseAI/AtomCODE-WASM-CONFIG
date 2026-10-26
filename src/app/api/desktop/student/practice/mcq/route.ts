import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolledInModule, ensureUserModuleData } from "@/lib/desktop-helpers";

/**
 * POST /api/desktop/student/practice/mcq
 * Server-side graded MCQ submission.
 * Body: { moduleId, answers: [{ mcqId, selected: 1..4 }], duration?, tabswitches? }
 * Correct answers never reach the client — grading happens here.
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  const body = await req.json().catch(() => null);
  const moduleId = String(body?.moduleId ?? "");
  const answers: { mcqId: string; selected: number }[] = Array.isArray(
    body?.answers
  )
    ? body.answers
    : [];
  const duration = Number(body?.duration ?? 0) || 0;
  const tabswitches = Number(body?.tabswitches ?? 0) || 0;

  const { ok, module: mod } = await isEnrolledInModule(uid, moduleId);
  if (!mod) return fail(404, "Module not found");
  if (!ok) return fail(403, "You are not enrolled in this module's course");

  try {
    const already = await db.userMCQData.findFirst({
      where: { userId: uid, moduleId },
    });
    if (already) {
      return fail(409, "MCQ test already submitted for this module", {
        score: already.score,
        errors: already.errors,
      });
    }

    const mcqs = await db.mCQQuestion.findMany({
      where: { moduleId },
      select: { id: true, CorrectOption: true },
    });

    const keyMap = new Map(mcqs.map((m) => [m.id, m.CorrectOption]));
    let score = 0;
    let errors = 0;
    for (const a of answers) {
      const correct = keyMap.get(String(a.mcqId));
      if (correct === undefined) continue;
      if (Number(a.selected) === correct) score += 1;
      else errors += 1;
    }

    await db.userMCQData.create({
      data: {
        userId: uid,
        moduleId,
        score,
        errors,
        submissiontype: "desktop",
        tabswitches,
        status: "submitted",
        duration: String(duration),
      },
    });

    // Update the module tracking row (mirrors mcqdataUpdateModule)
    const umd = await ensureUserModuleData(uid, mod.courseId, moduleId);
    await db.userModuleData.update({
      where: { id: umd.id },
      data: {
        mcqtime: duration,
        mcqstatus: "submitted",
        usermcqscore: score,
      },
    });

    return json({
      success: true,
      message: "MCQ submission completed!",
      score,
      errors,
      total: mcqs.length,
    });
  } catch (e) {
    console.error("[desktop/practice/mcq]", e);
    return fail(500, "Failed to submit MCQ attempt");
  }
}

export async function OPTIONS() {
  return preflight();
}
