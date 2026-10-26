import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import {
  isEnrolledInModule,
  sanitizeMcq,
  sanitizeCodeQuestion,
  DESKTOP_ENGINE_LANGUAGES,
} from "@/lib/desktop-helpers";

/**
 * GET /api/desktop/student/modules/[mid]
 * Module detail for practice: sanitized MCQs (no correct answers),
 * sanitized code questions, references and the student's own progress on
 * this module. Hidden test cases are included only for the languages the
 * desktop client executes with its bundled runtimes (client-side judging);
 * for C/C++/Java they stay server-side inside /api/desktop/run.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ mid: string }> }
) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;
  const { mid } = await params;

  const { ok, module: mod } = await isEnrolledInModule(uid, mid);
  if (!mod) return fail(404, "Module not found");
  if (!ok) return fail(403, "You are not enrolled in this module's course");

  try {
    const [mcqs, codeQuestions, progress, mcqSubmission] = await Promise.all([
      db.mCQQuestion.findMany({ where: { moduleId: mid } }),
      db.codeQuestion.findMany({ where: { moduleId: mid } }),
      db.userModuleData.findFirst({
        where: { userId: uid, moduleId: mid },
      }),
      db.userMCQData.findFirst({ where: { userId: uid, moduleId: mid } }),
    ]);

    const codeSubmissions = await db.userCodeQuestionData.findMany({
      where: { userId: uid, moduleId: mid },
      select: {
        questionId: true,
        status: true,
        usercode: true,
        testcase1status: true,
        testcase2status: true,
        testcase3status: true,
      },
    });

    const codeStatusMap = Object.fromEntries(
      codeSubmissions.map((s) => [s.questionId, s])
    );

    return json({
      module: {
        id: mod.id,
        title: mod.title,
        courseId: mod.courseId,
        language: mod.language,
        maxscore: mod.maxscore,
        concepturl: mod.concepturl,
      },
      references: await db.moduleReferences.findMany({
        where: { moduleId: mid },
        select: { id: true, title: true, link: true, type: true },
      }),
      mcqs: mcqs.map(sanitizeMcq),
      codeQuestions: codeQuestions.map((q) => ({
        ...sanitizeCodeQuestion(q, {
          includeHiddenTests: DESKTOP_ENGINE_LANGUAGES.includes(
            (q.lang ?? "").toLowerCase() as (typeof DESKTOP_ENGINE_LANGUAGES)[number]
          ),
        }),
        submissionstatus: codeStatusMap[q.id]?.status === "submitted",
        lastcode: codeStatusMap[q.id]?.usercode ?? null,
        testcaseStatuses: codeStatusMap[q.id]
          ? [
              codeStatusMap[q.id].testcase1status,
              codeStatusMap[q.id].testcase2status,
              codeStatusMap[q.id].testcase3status,
            ]
          : null,
      })),
      progress: progress
        ? {
            umid: progress.id,
            modulestatus: progress.modulestatus,
            mcqstatus: progress.mcqstatus,
            questionstatus: progress.questionstatus,
            usermcqscore: progress.usermcqscore,
            totalmcqscore: progress.totalmcqscore,
            userquestionscore: progress.userquestionscore,
            totalquestionscore: progress.totalquestionscore,
          }
        : null,
      mcqSubmitted: mcqSubmission
        ? { score: mcqSubmission.score, errors: mcqSubmission.errors }
        : null,
    });
  } catch (e) {
    console.error("[desktop/module detail]", e);
    return fail(500, "Failed to load module");
  }
}

export async function OPTIONS() {
  return preflight();
}
