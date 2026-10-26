import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolledInModule } from "@/lib/desktop-helpers";
import {
  executeNative,
  NATIVE_LANGUAGES,
  normalizeOutput,
} from "@/lib/native-executor";

/**
 * POST /api/desktop/run — built-in server-side code execution for the
 * Electron desktop client (student-only, token authenticated).
 *
 * The compiled languages (C, C++, Java) run on the server's built-in
 * toolchains via native-executor.ts — no external judge API is involved.
 * Expected outputs of hidden test cases never leave the server.
 *
 * Body: { questionId, code, mode: "sample" | "tests", moduleId?, assessmentId?, versionProfileId? }
 *  - practice questions → pass moduleId (enrollment checked on the module)
 *  - assessment questions → pass assessmentId (active attempt checked)
 *  sample → runs against sampleinput1/sampleoutput1  (output is returned)
 *  tests  → runs the 3 hidden test cases             (only pass/fail + program
 *           output is returned, never the expected output)
 */
const NATIVE_RUN_TIMEOUT_MS = 15_000;

export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.questionId ?? "");
  const moduleId = String(body?.moduleId ?? "");
  const assessmentId = String(body?.assessmentId ?? "");
  const code = String(body?.code ?? "");
  const mode = String(body?.mode ?? "sample");
  const versionProfileId = body?.versionProfileId
    ? String(body.versionProfileId)
    : undefined;

  if (!code.trim()) return fail(400, "Code is empty");
  if (!questionId) return fail(400, "'questionId' is required");
  if (!moduleId && !assessmentId)
    return fail(400, "Provide 'moduleId' (practice) or 'assessmentId' (assessment)");

  let question: {
    lang: string;
    sampleinput1: string;
    sampleoutput1: string;
    input1: string;
    input2: string;
    input3: string;
    output1: string;
    output2: string;
    output3: string;
  } | null = null;

  if (assessmentId) {
    // Assessment question: require an existing attempt by this student
    const attempt = await db.userAssessmentData.findFirst({
      where: { userId: uid, assessmentId },
    });
    if (!attempt)
      return fail(403, "No active attempt for this assessment");
    question = await db.codeQuestion.findFirst({
      where: { id: questionId, assessmentsId: assessmentId },
    });
  } else {
    const { ok, module: mod } = await isEnrolledInModule(uid, moduleId);
    if (!mod) return fail(404, "Module not found");
    if (!ok) return fail(403, "You are not enrolled in this module's course");
    question = await db.codeQuestion.findFirst({
      where: { id: questionId, moduleId },
    });
  }

  if (!question) return fail(404, "Code question not found");

  // Only the compiled languages have a built-in server execution target.
  const lang = question.lang as (typeof NATIVE_LANGUAGES)[number];
  if (!NATIVE_LANGUAGES.includes(lang)) {
    return fail(
      503,
      `Built-in execution for "${question.lang}" is not available on this server yet (C, C++ and Java are enabled).`
    );
  }

  const runOnce = async (input: string) =>
    executeNative({
      profileId: versionProfileId,
      language: lang,
      code,
      stdin: input,
      timeoutMs: NATIVE_RUN_TIMEOUT_MS,
    });

  try {
    if (mode === "sample") {
      const outcome = await runOnce(question.sampleinput1);
      if (!outcome.ok) {
        return json({
          mode,
          compileMessage: "Error",
          output: outcome.message,
          passed: false,
        });
      }
      const passed =
        normalizeOutput(outcome.stdout) ===
        normalizeOutput(question.sampleoutput1);
      return json({
        mode,
        compileMessage: passed ? "Success" : "Failed",
        output: outcome.stdout,
        passed,
      });
    }

    // mode === "tests" — the three hidden cases, judged independently.
    const cases = [
      { input: question.input1, expected: question.output1 },
      { input: question.input2, expected: question.output2 },
      { input: question.input3, expected: question.output3 },
    ];

    const results = [];
    for (let index = 0; index < cases.length; index++) {
      const testCase = cases[index];
      // Mirror the web judge: a case with no input AND no expected output is
      // a placeholder — auto-pass it instead of demanding empty program output.
      if (
        index > 0 &&
        (testCase.input ?? "") === "" &&
        (testCase.expected ?? "") === ""
      ) {
        results.push({ status: "pass", output: "" });
        continue;
      }
      const outcome = await runOnce(testCase.input ?? "");
      if (!outcome.ok) {
        results.push({ status: "error", output: outcome.message });
        continue;
      }
      const passed =
        normalizeOutput(outcome.stdout) === normalizeOutput(testCase.expected ?? "");
      results.push({ status: passed ? "pass" : "fail", output: outcome.stdout });
    }

    return json({
      mode,
      compileMessage: results.every((r) => r.status !== "error")
        ? "Success"
        : "Error",
      testcase1status: results[0].status,
      testcase2status: results[1].status,
      testcase3status: results[2].status,
      output1: results[0].output,
      output2: results[1].output,
      output3: results[2].output,
      passedCount: results.filter((r) => r.status === "pass").length,
    });
  } catch (e) {
    console.error("[desktop/run]", e);
    return fail(502, "Code execution failed — the built-in runtime hit an unexpected error");
  }
}

export async function OPTIONS() {
  return preflight();
}
