import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { getAllUserCourses } from "@/data/student/courses";
import { getAssessmentsByUserId } from "@/data/student/assessments";

/**
 * GET /api/desktop/student/dashboard — aggregated overview for the student.
 */
export async function GET(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  try {
    const [courses, assessments, moduleRows] = await Promise.all([
      getAllUserCourses(uid),
      getAssessmentsByUserId(uid),
      db.userModuleData.findMany({
        where: { userId: uid },
        select: {
          modulestatus: true,
          usermcqscore: true,
          totalmcqscore: true,
          userquestionscore: true,
          totalquestionscore: true,
        },
      }),
    ]);

    const submittedModules = moduleRows.filter(
      (m) => m.modulestatus === "submitted"
    );

    const scored = moduleRows.filter(
      (m) => (m.totalmcqscore ?? 0) + (m.totalquestionscore ?? 0) > 0
    );
    const totalEarned = scored.reduce(
      (sum, m) => sum + (m.usermcqscore ?? 0) + (m.userquestionscore ?? 0),
      0
    );
    const totalMax = scored.reduce(
      (sum, m) => sum + (m.totalmcqscore ?? 0) + (m.totalquestionscore ?? 0),
      0
    );

    const recentActivity = await db.userModuleData.findMany({
      where: { userId: uid },
      orderBy: { module: { moduledate: "desc" } },
      take: 5,
      select: {
        modulestatus: true,
        usermcqscore: true,
        totalmcqscore: true,
        userquestionscore: true,
        totalquestionscore: true,
        module: { select: { id: true, title: true, courseId: true } },
      },
    });

    return json({
      stats: {
        courses: courses.length,
        activeCourses: courses.filter((c) => c.courseStatus).length,
        modulesSubmitted: submittedModules.length,
        averageScore:
          totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : null,
        assessments: {
          total: assessments.length,
          startable: assessments.filter((a) =>
            ["start", "resume", "retake"].includes(a.status)
          ).length,
        },
      },
      courses,
      assessments: assessments.slice(0, 5),
      recentActivity,
    });
  } catch (e) {
    console.error("[desktop/dashboard]", e);
    return fail(500, "Failed to load dashboard");
  }
}

export async function OPTIONS() {
  return preflight();
}
