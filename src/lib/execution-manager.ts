/**
 * Execution manager — owns execution lifecycles for every runtime profile
 * (design doc §7):
 *
 * - Browser runtimes (Pyodide, ruby.wasm, SQLite, JS/TS) run in pooled
 *   Web Workers under public/workers/. Cheap runtimes (JavaScript/
 *   TypeScript) get a fresh worker per run via `disposeAfterRun` so global
 *   state never leaks between executions.
 * - Native-server profiles (C, C++, Java) POST to the app's built-in
 *   execution endpoint (/api/execute/native), which drives the server's own
 *   gcc / g++ / ECJ+JVM toolchains — no external execution API, no keys.
 * - The UI owns the timeout: on expiry the worker is terminated (or the
 *   fetch aborted) immediately — an infinite loop inside a runtime cannot
 *   interrupt itself — and the next run starts from a clean slate.
 * - Every request carries a unique executionId; late responses from a
 *   previous execution are ignored.
 * - Unverified profiles are refused before any code reaches a runtime.
 */

import type {
  RunRequest,
  RunResult,
  WorkerResponse,
} from "./execution-types";
import type { RuntimeProfile, WorkerKind } from "./runtime-registry";

export class RuntimeUnavailableError extends Error {
  constructor(profileLabel: string) {
    super(
      `${profileLabel} runtime is not configured in this build. Add its pinned assets under public/runtimes/ to enable it.`
    );
    this.name = "RuntimeUnavailableError";
  }
}

const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 180_000;

/**
 * Workers are bundled to plain ES-module files under public/workers/ by
 * scripts/build-workers.mjs (`bun run workers:build`) — the doc's own
 * project layout (§5). Next.js's webpack does not compile new Worker(new
 * URL(...)) entries, so the execution manager constructs module workers
 * directly from those self-hosted, same-origin bundles.
 */
function workerUrlFor(kind: WorkerKind): string {
  return `/workers/${kind}.worker.js`;
}

interface PendingEntry {
  resolve: (result: RunResult) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  workerKind: WorkerKind;
  disposeAfterRun: boolean;
}

class ExecutionManager {
  private workers = new Map<WorkerKind, Worker>();
  private pending = new Map<string, PendingEntry>();
  private seq = 0;

  /**
   * Execute source code with the given profile. Resolves with a RunResult
   * or rejects with an Error (timeout / runtime failure).
   */
  async run(
    profile: RuntimeProfile,
    input: { code: string; stdin?: string; timeoutMs?: number }
  ): Promise<RunResult> {
    if (!profile.verified) {
      throw new RuntimeUnavailableError(profile.label);
    }

    // Native toolchains (C / C++ / Java) execute through the app's own
    // server endpoint — same request/response contract as the workers.
    if (profile.mode === "native-server") {
      return this.runOnNativeServer(profile, input);
    }

    if (!profile.workerKind) {
      throw new RuntimeUnavailableError(profile.label);
    }

    const executionId = `exec-${Date.now().toString(36)}-${++this.seq}`;
    const timeoutMs = Math.min(
      Math.max(input.timeoutMs ?? profile.defaultTimeoutMs, MIN_TIMEOUT_MS),
      MAX_TIMEOUT_MS
    );

    const worker = this.obtainWorker(profile.workerKind);

    return new Promise<RunResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(executionId);
        // Doc §7: terminate the runtime — the only reliable way to stop a
        // synchronous infinite loop inside it.
        this.terminateWorker(profile.workerKind!);
        reject(new Error("Execution timed out."));
      }, timeoutMs);

      this.pending.set(executionId, {
        resolve,
        reject,
        timer,
        workerKind: profile.workerKind!,
        disposeAfterRun: Boolean(profile.disposeAfterRun),
      });

      const request: RunRequest = {
        type: "run",
        executionId,
        language: profile.language,
        versionProfileId: profile.id,
        code: input.code,
        stdin: input.stdin ?? "",
        timeoutMs,
        runtimeBasePath: profile.runtimeBasePath,
      };
      worker.postMessage(request);
    });
  }

  /** Terminate every pooled worker (used when the host view unmounts). */
  disposeAll() {
    for (const kind of [...this.workers.keys()]) {
      this.terminateWorker(kind);
    }
  }

  // ───────────────────────────── internals ────────────────────────────────

  /**
   * Built-in server toolchain path (C / C++ / Java). The endpoint answers
   * with the same WorkerResponse protocol; the server enforces its own hard
   * compile/run timeouts, while the AbortController guards the transport.
   */
  private async runOnNativeServer(
    profile: RuntimeProfile,
    input: { code: string; stdin?: string; timeoutMs?: number }
  ): Promise<RunResult> {
    const executionId = `exec-${Date.now().toString(36)}-${++this.seq}`;
    const timeoutMs = Math.min(
      Math.max(input.timeoutMs ?? profile.defaultTimeoutMs, MIN_TIMEOUT_MS),
      MAX_TIMEOUT_MS
    );
    const controller = new AbortController();
    const transportTimer = setTimeout(
      () => controller.abort(),
      timeoutMs + 2_000
    );

    try {
      const response = await fetch("/api/execute/native", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "run",
          executionId,
          language: profile.language,
          versionProfileId: profile.id,
          code: input.code,
          stdin: input.stdin ?? "",
          timeoutMs,
        }),
        signal: controller.signal,
      });

      const data = (await response.json()) as WorkerResponse & {
        message?: string;
      };

      if (response.status === 401) {
        throw new Error("Your session expired — sign in again to run code.");
      }

      if (data.type === "result") {
        return data;
      }
      throw new Error(data.message || "Execution failed on the server.");
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("Execution timed out.");
      }
      throw error instanceof Error
        ? error
        : new Error(String(error) || "Execution failed.");
    } finally {
      clearTimeout(transportTimer);
    }
  }

  private obtainWorker(kind: WorkerKind): Worker {
    const existing = this.workers.get(kind);
    if (existing) return existing;

    const worker = new Worker(workerUrlFor(kind), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) =>
      this.handleWorkerMessage(event.data);
    worker.onerror = (event) => {
      // Worker-level failure: reject everything pending and evict.
      const error = new Error(event.message || "Worker failed.");
      this.rejectAllPending(error);
      this.terminateWorker(kind);
    };
    worker.onmessageerror = () => {
      this.rejectAllPending(new Error("Worker message error."));
      this.terminateWorker(kind);
    };
    this.workers.set(kind, worker);
    return worker;
  }

  private handleWorkerMessage(response: WorkerResponse) {
    const entry = this.pending.get(response.executionId);
    if (!entry) return; // late response from an aborted execution
    this.pending.delete(response.executionId);
    clearTimeout(entry.timer);

    if (response.type === "result") {
      entry.resolve(response);
      // Doc §7: fresh execution context for cheap runtimes so global state
      // never leaks between runs.
      if (entry.disposeAfterRun) this.terminateWorker(entry.workerKind);
    } else {
      // Compile/execute errors leave the runtime usable — keep the worker.
      entry.reject(new Error(response.message));
    }
  }

  private rejectAllPending(error: Error) {
    for (const [executionId, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(error);
      this.pending.delete(executionId);
    }
  }

  private terminateWorker(kind: WorkerKind) {
    const worker = this.workers.get(kind);
    if (worker) {
      worker.terminate();
      this.workers.delete(kind);
    }
  }
}

export const executionManager = new ExecutionManager();
