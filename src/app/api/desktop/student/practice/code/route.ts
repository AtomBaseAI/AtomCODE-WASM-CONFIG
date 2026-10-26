import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolledInModule, ensureUserModuleData } from "@/lib/desktop-helpers";

/**
 * POST /api/desktop/student/practice/code
 * Saves a coding-question submission (mirrors the web submitquestion flow).
 * Body: {
 *   questionId, moduleId, usercode,
 *   score?,            // 1 when the sample test passed (web behaviour)
 *   compiles?, errors?,
 *   testcase1status?/testcase2status?/testcase3status?,  // "pass"|"fail"
 *   duration?, tabswitches?
 * }
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.questionId ?? "");
  const moduleId = String(body?.moduleId ?? "");

  const { ok, module: mod } = await isEnrolledInModule(uid, moduleId);
  if (!mod) return fail(404, "Module not found");
  if (!ok) return fail(403, "You are not enrolled in this module's course");

  const question = await db.codeQuestion.findFirst({
    where: { id: questionId, moduleId },
  });
  if (!question) return fail(404, "Code question not found in this module");

  const data = {
    // Web parity: 1 mark for the sample run + 3 per hidden test (max 10/question)
    score: Math.max(0, Math.min(10, Number(body?.score ?? 0))),
    compiles: Math.max(0, Number(body?.compiles ?? 1)),
    errors: Math.max(0, Number(body?.errors ?? 0)),
    submissiontype: "desktop",
    tabswitches: Math.max(0, Number(body?.tabswitches ?? 0)),
    status: "submitted" as const,
    usercode: String(body?.usercode ?? ""),
    duration: String(Math.max(0, Number(body?.duration ?? 0)) | 0),
    testcase1status: body?.testcase1status ? String(body.testcase1status) : null,
    testcase2status: body?.testcase2status ? String(body.testcase2status) : null,
    testcase3status: body?.testcase3status ? String(body.testcase3status) : null,
  };

  try {
    const existing = await db.userCodeQuestionData.findUnique({
      where: { userId_questionId: { userId: uid, questionId } },
    });

    let message: string;
    if (existing && existing.status === "retake") {
      await db.userCodeQuestionData.update({
        where: { id: existing.id },
        data,
      });
      message = "Code retake submitted!";
    } else if (existing) {
      return fail(409, "Code already submitted for this question!");
    } else {
      await db.userCodeQuestionData.create({
        data: { userId: uid, questionId, moduleId, ...data },
      });
      message = "Code submitted!";
    }

    // Recompute module-level code totals (mirrors codedataUpdateModule)
    const rows = await db.userCodeQuestionData.findMany({
      where: { userId: uid, moduleId },
    });
    const umd = await ensureUserModuleData(uid, mod.courseId, moduleId);
    await db.userModuleData.update({
      where: { id: umd.id },
      data: {
        questiontime: rows.reduce(
          (t, r) => t + (parseInt(r.duration || "0") || 0),
          0
        ),
        questionstatus: "submitted",
        userquestionscore: rows.reduce((t, r) => t + r.score, 0),
        errors: rows.reduce((t, r) => t + r.errors, 0),
        compiles: rows.reduce((t, r) => t + r.compiles, 0),
      },
    });

    return json({ success: true, message });
  } catch (e) {
    console.error("[desktop/practice/code]", e);
    return fail(500, "Failed to submit code");
  }
}

export async function OPTIONS() {
  return preflight();
}
