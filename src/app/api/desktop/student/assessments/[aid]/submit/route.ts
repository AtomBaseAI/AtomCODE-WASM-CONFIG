import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";

/**
 * POST /api/desktop/student/assessments/[aid]/submit
 * Records assessment results and finalizes the attempt.
 *
 * Body: {
 *   uaid: string,
 *   mcq?:   { score, errors, duration?, tabswitches? },
 *   code?:  [{ questionId, usercode?, score?, compiles?, errors?,
 *              testcase1status?, testcase2status?, testcase3status?, duration? }],
 *   finalize?: boolean   // default true → status "submitted"
 * }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ aid: string }> }
) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;
  const { aid } = await params;

  const body = await req.json().catch(() => null);
  const uaid = String(body?.uaid ?? "");
  if (!uaid) return fail(400, "'uaid' is required");

  try {
    const attempt = await db.userAssessmentData.findUnique({ where: { id: uaid } });
    if (!attempt) return fail(404, "Attempt not found");
    if (attempt.userId !== uid) return fail(403, "This attempt belongs to another student");
    if (attempt.assessmentId !== aid)
      return fail(400, "Attempt does not match this assessment");

    const finalize = body?.finalize !== false;

    if (attempt.status === "submitted") {
      return fail(409, "This attempt has already been submitted");
    }

    // ---- MCQ part -----------------------------------------------------
    if (body?.mcq) {
      const m = body.mcq;
      let score = Math.max(0, Number(m.score ?? 0));
      let errors = Math.max(0, Number(m.errors ?? 0));

      // Preferred path: grade the raw answers server-side (the client never
      // receives correct options, so it cannot grade itself).
      if (Array.isArray(m.answers)) {
        score = 0;
        errors = 0;
        const mcqs = await db.mCQQuestion.findMany({
          where: { assessmentsId: aid },
          select: { id: true, CorrectOption: true },
        });
        const keyMap = new Map(mcqs.map((q) => [q.id, q.CorrectOption]));
        for (const a of m.answers) {
          const correct = keyMap.get(String(a.mcqId));
          if (correct === undefined) continue;
          if (Number(a.selected) === correct) score += 1;
          else errors += 1;
        }
      }

      const existingMcq = await db.userAssessmentMCQData.findFirst({
        where: { userId: uid, assessmentId: aid },
      });
      const mcqData = {
        score,
        errors,
        submissiontype: "desktop",
        status: "submitted",
        duration: String(Math.max(0, Number(m.duration ?? 0)) | 0),
      };
      if (existingMcq) {
        await db.userAssessmentMCQData.update({
          where: { id: existingMcq.id },
          data: mcqData,
        });
      } else {
        await db.userAssessmentMCQData.create({
          data: { userId: uid, assessmentId: aid, ...mcqData },
        });
      }
    }

    // ---- Code part ----------------------------------------------------
    if (Array.isArray(body?.code)) {
      for (const c of body.code) {
        const questionId = String(c.questionId ?? "");
        if (!questionId) continue;
        const q = await db.codeQuestion.findFirst({
          where: { id: questionId, assessmentsId: aid },
        });
        if (!q) continue;

        const rowData = {
          score: Math.max(0, Number(c.score ?? 0)),
          compiles: Math.max(0, Number(c.compiles ?? 1)),
          errors: Math.max(0, Number(c.errors ?? 0)),
          submissiontype: "desktop",
          status: "submitted",
          usercode: c.usercode ? String(c.usercode) : null,
          duration: String(Math.max(0, Number(c.duration ?? 0)) | 0),
          testcase1status: c.testcase1status ? String(c.testcase1status) : null,
          testcase2status: c.testcase2status ? String(c.testcase2status) : null,
          testcase3status: c.testcase3status ? String(c.testcase3status) : null,
        };

        const existing = await db.userAssessmentCodeData.findUnique({
          where: {
            userId_questionId: { userId: uid, questionId },
          },
        });
        if (existing) {
          await db.userAssessmentCodeData.update({
            where: { id: existing.id },
            data: rowData,
          });
        } else {
          await db.userAssessmentCodeData.create({
            data: { userId: uid, questionId, assessmentId: aid, ...rowData },
          });
        }
      }
    }

    // ---- Aggregate into the attempt record -----------------------------
    const mcqRow = await db.userAssessmentMCQData.findFirst({
      where: { userId: uid, assessmentId: aid },
    });
    const codeRows = await db.userAssessmentCodeData.findMany({
      where: { userId: uid, assessmentId: aid },
    });

    const totalMcqScore = attempt.totalmcqscore ?? 0;
    const totalQuestionScore = attempt.totalquestionscore ?? 0;
    const usermcqscore = mcqRow?.score ?? attempt.usermcqscore ?? 0;
    const userquestionscore =
      codeRows.reduce((t, r) => t + r.score, 0) || attempt.userquestionscore || 0;

    await db.userAssessmentData.update({
      where: { id: uaid },
      data: {
        mcqstatus: mcqRow ? "submitted" : attempt.mcqstatus,
        mcqtime: mcqRow ? Number(mcqRow.duration || 0) : attempt.mcqtime,
        usermcqscore,
        questionstatus: codeRows.length > 0 ? "submitted" : attempt.questionstatus,
        userquestionscore,
        errors:
          (mcqRow?.errors ?? 0) + codeRows.reduce((t, r) => t + r.errors, 0),
        compiles: codeRows.reduce((t, r) => t + r.compiles, 0),
        status: finalize ? "submitted" : "started",
        submissiontype: "desktop",
      },
    });

    return json({
      success: true,
      message: finalize ? "Assessment submitted!" : "Progress saved",
      scores: {
        mcq: { earned: usermcqscore, total: totalMcqScore },
        code: { earned: userquestionscore, total: totalQuestionScore },
        overall: {
          earned: usermcqscore + userquestionscore,
          total: totalMcqScore + totalQuestionScore,
        },
      },
    });
  } catch (e) {
    console.error("[desktop/assessment/submit]", e);
    return fail(500, "Failed to submit assessment");
  }
}

export async function OPTIONS() {
  return preflight();
}
