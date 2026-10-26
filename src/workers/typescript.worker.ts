/**
 * TypeScript worker — transpile with the pinned TypeScript compiler, then
 * execute the emitted JavaScript (design doc §9).
 *
 * Deviation from the doc's example: instead of spawning a nested Worker
 * (bundler-dependent), the transpiled output is evaluated inside this same
 * isolated worker via AsyncFunction. The UI still creates a fresh worker per
 * run (`disposeAfterRun`), which preserves the doc's isolation goal: student
 * globals never outlive one execution and never touch the UI thread.
 */

import ts from "typescript";
import type {
  RunRequest,
  RunResult,
  WorkerResponse,
} from "../lib/execution-types";

const AsyncFunctionConstructor = Object.getPrototypeOf(
  async function () {}
).constructor as typeof Function;

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const request = event.data;
  if (request.type !== "run") return;

  const started = performance.now();

  // ── compile stage ─────────────────────────────────────────────────────────
  const compiled = ts.transpileModule(request.code, {
    fileName: "student.ts",
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
      strict: true,
    },
  });

  const compileErrors = (compiled.diagnostics ?? [])
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map(
      (diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    );

  if (compileErrors.length > 0) {
    const response: WorkerResponse = {
      type: "error",
      executionId: request.executionId,
      message: compileErrors.join("\n"),
      stage: "compile",
    };
    self.postMessage(response);
    return;
  }

  // ── execute stage ─────────────────────────────────────────────────────────
  const output: string[] = [];
  const errors: string[] = [];
  const compileTimeMs = performance.now() - started;

  const pushLine = (sink: string[], args: unknown[]) => {
    sink.push(
      args
        .map((value) => {
          if (typeof value === "string") return value;
          try {
            return String(value);
          } catch {
            return "[unprintable]";
          }
        })
        .join(" ")
    );
  };

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  try {
    console.log = (...args: unknown[]) => pushLine(output, args);
    console.error = (...args: unknown[]) => pushLine(errors, args);
    console.warn = (...args: unknown[]) => pushLine(errors, args);

    try {
      const program = new AsyncFunctionConstructor(compiled.outputText);
      await program();
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }

    const response: RunResult = {
      type: "result",
      executionId: request.executionId,
      stdout: output.join("\n"),
      stderr: errors.join("\n"),
      compileTimeMs,
      executionTimeMs: performance.now() - started,
      exitCode: 0,
    };

    self.postMessage(response);
  } catch (error) {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    const response: WorkerResponse = {
      type: "error",
      executionId: request.executionId,
      message:
        (error instanceof Error ? error.message : String(error)) ||
        "Runtime exception.",
      stage: "execute",
    };
    self.postMessage(response);
  }
};
