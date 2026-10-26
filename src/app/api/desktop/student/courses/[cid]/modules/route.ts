import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolled } from "@/lib/desktop-helpers";
import { getAllModulesByCourseId } from "@/data/student/modules";
import { getCourseById } from "@/data/student/courses";

/**
 * GET /api/desktop/student/courses/[cid]/modules
 * Active modules of an enrolled course + the student's per-module progress.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ cid: string }> }
) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const { cid } = await params;

  if (!(await isEnrolled(ctx.user.id, cid))) {
    return fail(403, "You are not enrolled in this course");
  }

  try {
    const [course, modules, progressRows, feedbacks] = await Promise.all([
      getCourseById(cid),
      getAllModulesByCourseId(cid),
      db.userModuleData.findMany({
        where: { userId: ctx.user.id, courseId: cid },
        select: {
          moduleId: true,
          modulestatus: true,
          mcqstatus: true,
          questionstatus: true,
          usermcqscore: true,
          totalmcqscore: true,
          userquestionscore: true,
          totalquestionscore: true,
          mcqtime: true,
          questiontime: true,
          errors: true,
          compiles: true,
        },
      }),
      db.feedbacks.findMany({
        where: { courseId: cid },
        select: { id: true, title: true, link: true, date: true },
      }),
    ]);

    if (!course) return fail(404, "Course not found");

    const progress = Object.fromEntries(
      progressRows.map((p) => [p.moduleId, p])
    );

    return json({ course, modules, progress, feedbacks });
  } catch (e) {
    console.error("[desktop/course modules]", e);
    return fail(500, "Failed to load modules");
  }
}

export async function OPTIONS() {
  return preflight();
}
