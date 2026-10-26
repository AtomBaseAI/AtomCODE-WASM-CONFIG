import OpenAI from "openai";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { db } from "@/lib/db";

/**
 * POST /api/desktop/student/ai — ATOM AI tutor (mirrors src/actions/ai.ts).
 * Body: { questionId, moduleId?, assessmentId?, code? }
 * The server loads the question itself (students cannot inject the prompt
 * with arbitrary test data) and asks the configured model for guidance.
 * Requires OPENAI_API_KEY on the server; otherwise 503.
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  if (!process.env.OPENAI_API_KEY) {
    return fail(
      503,
      "ATOM AI tutor is not configured on this server (missing OPENAI_API_KEY)."
    );
  }

  const body = await req.json().catch(() => null);
  const questionId = String(body?.questionId ?? "");
  const moduleId = String(body?.moduleId ?? "");
  const assessmentId = String(body?.assessmentId ?? "");
  const code = body?.code ? String(body.code) : null;

  if (!questionId) return fail(400, "'questionId' is required");
  if (!moduleId && !assessmentId)
    return fail(400, "Provide 'moduleId' (practice) or 'assessmentId' (assessment)");

  try {
    let question = null;
    if (assessmentId) {
      const attempt = await db.userAssessmentData.findFirst({
        where: { userId: uid, assessmentId },
      });
      if (!attempt) return fail(403, "No active attempt for this assessment");
      question = await db.codeQuestion.findFirst({
        where: { id: questionId, assessmentsId: assessmentId },
      });
    } else {
      const enrollment = await db.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true },
      });
      if (!enrollment) return fail(404, "Module not found");
      const enrolled = await db.userCourse.findFirst({
        where: { userId: uid, courseId: enrollment.courseId, active: true },
      });
      if (!enrolled) return fail(403, "You are not enrolled in this module's course");
      question = await db.codeQuestion.findFirst({
        where: { id: questionId, moduleId },
      });
    }
    if (!question) return fail(404, "Code question not found");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            " You are an expert programmer in all programming languages named ATOM AI, tasked with analyzing programming questions, test cases, and junior-level user code. Provide concise suggestions or key code snippets as needed in master level , do not provide entire code (important note - do not provide the entire code / entire example , provide only essential block of code & don't mention or show code based on whitelist & blocklist based data in output), highlighting best practices. Avoid revealing input data and share only essential guidance, please format your response using Markdown ",
        },
        {
          role: "user",
          content: `
                    Question: ${question.title}
                    Description: ${question.description}
                    Input Constraints: ${question.inputconstrains || "None"}
                    Blacklist: ${question.blacklist || "None"}
                    Whitelist: ${question.whitelist || "None"}
                    Test Case 1 Input: ${question.sampleinput1}
                    Test Case 1 Output: ${question.sampleoutput1}
                    Test Case 2 Input: ${question.sampleinput2}
                    Test Case 2 Output: ${question.sampleoutput2}
                    Code: ${code || "No code provided"}
                `,
        },
      ],
    });

    return json({
      reply:
        completion.choices[0].message?.content?.trim() || "No response from AI.",
    });
  } catch (e) {
    console.error("[desktop/ai]", e);
    return fail(502, "ATOM AI request failed");
  }
}

export async function OPTIONS() {
  return preflight();
}
