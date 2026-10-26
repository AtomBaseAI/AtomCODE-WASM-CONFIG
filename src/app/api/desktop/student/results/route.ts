import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";

/**
 * GET /api/desktop/student/results — module results + assessment results.
 */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  try {
    const [moduleResults, assessmentResults] = await Promise.all([
      db.userModuleData.findMany({
        where: { userId: uid },
        select: {
          modulestatus: true,
          mcqstatus: true,
          questionstatus: true,
          usermcqscore: true,
          totalmcqscore: true,
          userquestionscore: true,
          totalquestionscore: true,
          modulemaxscore: true,
          module: { select: { id: true, title: true } },
          course: { select: { id: true, title: true, language: true } },
        },
      }),
      db.userAssessmentData.findMany({
        where: { userId: uid },
        select: {
          id: true,
          status: true,
          mcqstatus: true,
          questionstatus: true,
          usermcqscore: true,
          totalmcqscore: true,
          userquestionscore: true,
          totalquestionscore: true,
          assessmentmaxscore: true,
          assessments: { select: { id: true, title: true } },
          course: { select: { id: true, title: true } },
        },
      }),
    ]);

    return json({
      moduleResults: moduleResults.map((r) => ({
        courseId: r.course.id,
        courseName: r.course.title,
        language: r.course.language,
        moduleId: r.module.id,
        moduleName: r.module.title,
        status: r.modulestatus,
        mcq: {
          status: r.mcqstatus,
          earned: r.usermcqscore ?? 0,
          total: r.totalmcqscore ?? 0,
        },
        code: {
          status: r.questionstatus,
          earned: r.userquestionscore ?? 0,
          total: r.totalquestionscore ?? 0,
        },
      })),
      assessmentResults: assessmentResults.map((r) => ({
        uaid: r.id,
        assessmentId: r.assessments.id,
        assessmentName: r.assessments.title,
        courseName: r.course.title,
        status: r.status,
        mcq: { earned: r.usermcqscore ?? 0, total: r.totalmcqscore ?? 0 },
        code: { earned: r.userquestionscore ?? 0, total: r.totalquestionscore ?? 0 },
        maxScore: r.assessmentmaxscore ?? 0,
      })),
    });
  } catch (e) {
    console.error("[desktop/results]", e);
    return fail(500, "Failed to load results");
  }
}

export async function OPTIONS() {
  return preflight();
}
