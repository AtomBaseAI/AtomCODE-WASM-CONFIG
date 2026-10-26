/**
 * WASM judge — client-side replacement for the external HTTP judge
 * (NEXT_PUBLIC_LAMBDA_URL / NEXT_PUBLIC_LAMBDA_MULTI_URL).
 *
 * Reproduces the exact judge contract the app's runners are built on:
 *   - compileMessage ∈ "Success" | "Failed" | "Error"
 *     Success: the program ran and its output matches the expected output.
 *     Failed : the program ran but produced different output.
 *     Error  : compile/runtime failure (or the runtime itself is unavailable).
 *   - output: the program's actual stdout (rendered for SQL results).
 *
 * Output comparison mirrors the judge's tolerance: trailing whitespace per
 * line, CR/LF endings and trailing blank lines are normalized away.
 */

import { executionManager } from "./execution-manager";
import { RuntimeUnavailableError } from "./execution-manager";
import {
  getProfileById,
  resolveProfile,
  type RuntimeProfile,
} from "./runtime-registry";
import type { RunResult, SqlQueryPayload } from "./execution-types";

export type JudgeStatus = "Success" | "Failed" | "Error";

export interface SingleRunOutcome {
  compileMessage: JudgeStatus;
  /** Actual program output (grid text for SQL). */
  output: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
  executionTimeMs?: number;
  /** Structured SQL grid (SQLite profiles only). */
  sql?: SqlQueryPayload;
  /** The profile that actually executed. */
  profileId: string;
  profileLabel: string;
}

export interface TestCaseOutcome {
  status: JudgeStatus;
  output: string;
}

export function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();
}

function renderOutput(result: RunResult): string {
  if (result.sql) {
    if (result.sql.columns.length === 0) {
      return result.stdout || "Statement executed successfully.";
    }
    return result.stdout;
  }
  return result.stdout;
}

function unavailableOutcome(message: string): SingleRunOutcome {
  return {
    compileMessage: "Error",
    output: "",
    stderr: message,
    timedOut: false,
    durationMs: 0,
    profileId: "",
    profileLabel: "",
  };
}

/**
 * Execute a single source file against one stdin input and — optionally —
 * an expected output. When `expectedOutput` is omitted (playground mode) the
 * outcome is "Success" whenever the program runs without a compile/runtime
 * error, exactly like the previous judge's sample flow.
 */
export async function judgeRunSingle(opts: {
  lang: string;
  versionProfileId?: string | null;
  code: string;
  input?: string;
  expectedOutput?: string | null;
  timeoutMs?: number;
}): Promise<SingleRunOutcome> {
  const profile = resolveProfile(opts.lang, opts.versionProfileId);

  if (!profile) {
    return unavailableOutcome(
      `No runtime is configured for "${opts.lang}".`
    );
  }
  if (!profile.verified) {
    return unavailableOutcome(
      `${profile.label} runtime is not configured in this build.`
    );
  }

  try {
    const result = await executionManager.run(profile, {
      code: opts.code,
      stdin: opts.input ?? "",
      timeoutMs: opts.timeoutMs,
    });

    const output = renderOutput(result);
    const compileMessage: JudgeStatus =
      opts.expectedOutput == null
        ? "Success"
        : normalizeOutput(output) === normalizeOutput(opts.expectedOutput)
          ? "Success"
          : "Failed";

    return {
      compileMessage,
      output,
      stderr: result.stderr ?? "",
      timedOut: false,
      durationMs: result.executionTimeMs ?? 0,
      executionTimeMs: result.executionTimeMs,
      sql: result.sql,
      profileId: profile.id,
      profileLabel: profile.label,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.message === "Execution timed out.";
    const message =
      error instanceof RuntimeUnavailableError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    return {
      compileMessage: "Error",
      output: timedOut ? "Execution timed out." : message,
      stderr: message,
      timedOut,
      durationMs: 0,
      profileId: profile.id,
      profileLabel: profile.label,
    };
  }
}

/**
 * Execute one source file against 1..N (input, expectedOutput) pairs — the
 * multi-test-case judge contract. Each case reports Success / Failed / Error
 * independently; a runtime error is reported for every remaining case so the
 * UI's per-case badges keep their semantics.
 */
export async function judgeRunTestCases(opts: {
  lang: string;
  versionProfileId?: string | null;
  code: string;
  cases: { input: string; expectedOutput: string }[];
  timeoutMs?: number;
}): Promise<TestCaseOutcome[]> {
  const outcomes: TestCaseOutcome[] = [];

  for (const testCase of opts.cases) {
    // Skip cases the question never defined (empty input AND output).
    const emptyCase =
      (testCase.input ?? "") === "" && (testCase.expectedOutput ?? "") === "";
    if (emptyCase && opts.cases.length > 1) {
      outcomes.push({ status: "Success", output: "" });
      continue;
    }
    if (outcomes.some((o) => o.status === "Error")) {
      // Runtime already broken — report Error without re-running per case.
      outcomes.push({ status: "Error", output: "" });
      continue;
    }
    const outcome = await judgeRunSingle({
      lang: opts.lang,
      versionProfileId: opts.versionProfileId,
      code: opts.code,
      input: testCase.input ?? "",
      expectedOutput: testCase.expectedOutput ?? "",
      timeoutMs: opts.timeoutMs,
    });
    outcomes.push({ status: outcome.compileMessage, output: outcome.output });
  }

  return outcomes;
}

/** Resolve + validate a profile for UI display (dropdown state etc.). */
export function getVerifiedProfile(
  lang: string,
  versionProfileId?: string | null
): RuntimeProfile | undefined {
  const profile =
    (versionProfileId ? getProfileById(versionProfileId) : undefined) ??
    resolveProfile(lang, versionProfileId);
  return profile;
}
