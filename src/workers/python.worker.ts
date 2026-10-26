/**
 * Python worker — CPython in WebAssembly via Pyodide (design doc §10).
 *
 * Each `versionProfileId` maps to a pinned, self-hosted Pyodide build under
 * /runtimes/pyodide/<release>/ (registry → runtimeBasePath). Every profile
 * is a genuinely separate interpreter build (3.11, 3.12, 3.13, 3.14) —
 * switching versions loads that exact runtime, it does not emulate it.
 *
 * The worker is pooled across runs per browser session; stdout/stderr
 * handlers and the stdin buffer are re-installed for every execution.
 * Timeouts are enforced by the execution manager (worker termination) —
 * an infinite Python loop cannot interrupt itself from the inside.
 */

import type {
  RunRequest,
  RunResult,
  WorkerResponse,
} from "../lib/execution-types";

type PyodideInterface = {
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => string | null }) => void;
  globals: { set: (key: string, value: unknown) => void };
  runPythonAsync: (code: string) => Promise<unknown>;
};

type LoadPyodideFn = (options: { indexURL: string }) => Promise<PyodideInterface>;

// One interpreter per pinned runtime build (worker is shared across profiles).
const instances = new Map<string, Promise<PyodideInterface>>();

function getPyodide(basePath: string): Promise<PyodideInterface> {
  const existing = instances.get(basePath);
  if (existing) return existing;

  const origin = self.location.origin;
  const indexURL = new URL(basePath, origin).href;

  // Runtime assets are served from this app's own origin (doc §15). The
  // webpackIgnore comment keeps the bundler from rewriting the runtime URL.
  const load = import(/* webpackIgnore: true */ /* @vite-ignore */ indexURL
    .endsWith("/")
    ? `${indexURL}pyodide.mjs`
    : `${indexURL}/pyodide.mjs`) as Promise<{ loadPyodide: LoadPyodideFn }>;

  const promise = load
    .then((module) => module.loadPyodide({ indexURL }))
    .catch((error: unknown) => {
      instances.delete(basePath);
      throw new Error(
        `Failed to load Pyodide runtime from ${indexURL}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });

  instances.set(basePath, promise);
  return promise;
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const request = event.data;
  if (request.type !== "run") return;

  const started = performance.now();

  try {
    if (!request.runtimeBasePath) {
      throw new Error("Python profile is missing its runtime base path.");
    }

    const pyodide = await getPyodide(request.runtimeBasePath);

    const stdout: string[] = [];
    const stderr: string[] = [];

    pyodide.setStdout({ batched: (text) => stdout.push(text) });
    pyodide.setStderr({ batched: (text) => stderr.push(text) });

    // Explicit stdin (doc §6): feed the provided buffer, then signal EOF.
    let stdinBuffer = request.stdin ?? "";
    pyodide.setStdin({
      stdin: () => {
        if (stdinBuffer.length === 0) return null;
        const chunk = stdinBuffer;
        stdinBuffer = "";
        return chunk;
      },
    });

    pyodide.globals.set("student_source", request.code);

    await pyodide.runPythonAsync(
      `exec(compile(student_source, "<student>", "exec"))`
    );

    const response: RunResult = {
      type: "result",
      executionId: request.executionId,
      stdout: stdout.join(""),
      stderr: stderr.join(""),
      executionTimeMs: performance.now() - started,
      exitCode: 0,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: "error",
      executionId: request.executionId,
      message:
        (error instanceof Error ? error.message : String(error)) ||
        "Python runtime failed.",
      stage: "execute",
    };
    self.postMessage(response);
  }
};
