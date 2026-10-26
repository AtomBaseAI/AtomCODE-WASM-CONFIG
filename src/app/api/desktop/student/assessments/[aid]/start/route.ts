import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolled, currentISTTime, remainingSecondsIST } from "@/lib/desktop-helpers";
import { getAssessmentDataByAssessmentIdUserId } from "@/data/student/assessments";

/**
 * POST /api/desktop/student/assessments/[aid]/start
 * Validates the access key and opens (or resumes) an attempt.
 * Body: { accesskey }
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
  const accesskey = Number(body?.accesskey ?? NaN);

  try {
    const meta = await getAssessmentDataByAssessmentIdUserId(aid, uid);
    if (!meta) return fail(404, "Assessment not found");

    if (!["start", "retake", "resume"].includes(meta.status)) {
      return fail(
        403,
        meta.status === "upcoming"
          ? "This assessment has not started yet"
          : "This assessment is no longer available"
      );
    }

    // Resume continues an existing attempt — no key required (it was already
    // validated when the attempt was first opened).
    if (meta.status !== "resume") {
      if (Number.isNaN(accesskey) || Number(meta.accesskey) !== accesskey) {
        return fail(403, "Invalid access key");
      }
    }

    // Resume an already-started attempt
    if (meta.uaid && meta.status === "resume") {
      return json({
        success: true,
        uaid: meta.uaid,
        resumed: true,
        remainingtime: meta.prestarttime ? remainingSecondsIST(meta.prestarttime, meta.maxtime) : null,
        maxtime: meta.maxtime,
      });
    }

    const existing = await db.userAssessmentData.findFirst({
      where: { userId: uid, assessmentId: aid },
    });

    if (existing && (existing.status === "started" || existing.status === "retake")) {
      return json({
        success: true,
        uaid: existing.id,
        resumed: existing.status === "started",
        remainingtime: remainingSecondsIST(existing.assessmentstarttime, meta.maxtime),
        maxtime: meta.maxtime,
      });
    }

    if (existing && existing.status === "submitted") {
      return fail(409, "You have already submitted this assessment");
    }

    const assessment = await db.assessments.findUnique({
      where: { id: aid },
      select: {
        courseId: true,
        maxtime: true,
        tabswitches: true,
        maxscore: true,
        _count: { select: { mcqQuestions: true, codeQuestions: true } },
      },
    });
    if (!assessment) return fail(404, "Assessment not found");
    if (!(await isEnrolled(uid, assessment.courseId))) {
      return fail(403, "You are not enrolled in this course");
    }

    const now = currentISTTime();
    const record = await db.userAssessmentData.create({
      data: {
        userId: uid,
        courseId: assessment.courseId,
        assessmentId: aid,
        totalmcqscore: assessment._count.mcqQuestions,
        totalquestionscore: assessment._count.codeQuestions,
        assessmentmaxscore: assessment.maxscore,
        assessmentstarttime: now,
        userassessmentstarttime: now,
        usertabswitches: 0,
        maxtabswitches: assessment.tabswitches,
        maxtime: assessment.maxtime,
        status: "started",
        submissiontype: "desktop",
      },
    });

    return json({
      success: true,
      uaid: record.id,
      resumed: false,
      remainingtime: remainingSecondsIST(now, assessment.maxtime),
      maxtime: assessment.maxtime,
    });
  } catch (e) {
    console.error("[desktop/assessment/start]", e);
    return fail(500, "Failed to start assessment");
  }
}

