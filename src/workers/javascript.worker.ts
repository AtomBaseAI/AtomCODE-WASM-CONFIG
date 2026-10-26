/**
 * JavaScript worker — browser-native execution in an isolated worker
 * (design doc §8). A fresh worker is created for every run (see
 * `disposeAfterRun` in the registry) so global state never leaks.
 *
 * This is a learning playground, not a hardened sandbox: code runs in a
 * worker with no access to the UI thread, the app's cookies, or the DOM.
 * console output is captured; async/await is supported via AsyncFunction.
 */

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

  const output: string[] = [];
  const errors: string[] = [];
  const started = performance.now();

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

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

  try {
    console.log = (...args: unknown[]) => pushLine(output, args);
    console.error = (...args: unknown[]) => pushLine(errors, args);
    console.warn = (...args: unknown[]) => pushLine(errors, args);

    try {
      // Use Function/AsyncFunction only in the isolated worker, never on the
      // UI thread. This does not provide a complete security boundary.
      const program = new AsyncFunctionConstructor(request.code);
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
