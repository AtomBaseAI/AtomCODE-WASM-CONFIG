/* ================================================================
 * AtomCode Student Desktop — built-in code execution engine
 *
 * Plain-JS mirror of the web app's execution stack:
 *   src/lib/runtime-registry.ts   → ENGINE_PROFILES (this file)
 *   src/lib/execution-manager.ts  → AtomEngine.manager
 *   src/lib/wasm-judge.ts         → AtomEngine.judge helpers
 *
 * The same self-hosted runtime bundles the web app ships under
 * public/ are packaged with the desktop app (synced by
 * scripts/sync-engine-assets.mjs):
 *   renderer/workers/<kind>.worker.js    (ES-module workers)
 *   renderer/runtimes/pyodide/<ver>/     (CPython)
 *   renderer/runtimes/sqlite-wasm/       (SQLite)
 *   renderer/runtimes/ruby/3.4/          (CRuby)
 *
 * Compiled languages (C, C++, Java) are executed by the connected
 * AtomCode server's built-in toolchains via POST /api/desktop/run —
 * exactly like the web app's native-server profiles.
 * ================================================================ */

(function () {
  "use strict";

  /* ============================ registry ============================ */

  /**
   * Runtime profiles for the languages executed locally in the desktop
   * app — 1:1 mirror of the web registry (same ids, labels and base
   * paths) restricted to the worker-backed profiles.
   */
  const ENGINE_PROFILES = [
    // ── Python (CPython runtimes) ──────────────────────────────────────
    {
      id: "python-3.11",
      language: "python",
      label: "Python 3.11",
      workerKind: "python",
      verified: true,
      features: { stdin: true },
      runtimeBasePath: "/runtimes/pyodide/0.25.1/",
      disposeAfterRun: false,
      defaultTimeoutMs: 20000,
      order: 1,
    },
    {
      id: "python-3.12",
      language: "python",
      label: "Python 3.12",
      workerKind: "python",
      verified: true,
      features: { stdin: true },
      runtimeBasePath: "/runtimes/pyodide/0.26.4/",
      disposeAfterRun: false,
      defaultTimeoutMs: 20000,
      order: 2,
    },
    {
      id: "python-3.13",
      language: "python",
      label: "Python 3.13",
      workerKind: "python",
      verified: true,
      features: { stdin: true },
      runtimeBasePath: "/runtimes/pyodide/0.28.3/",
      disposeAfterRun: false,
      defaultTimeoutMs: 20000,
      order: 3,
    },
    {
      id: "python-3.14",
      language: "python",
      label: "Python 3.14",
      workerKind: "python",
      verified: true,
      features: { stdin: true },
      runtimeBasePath: "/runtimes/pyodide/314.0.7/",
      disposeAfterRun: false,
      defaultTimeoutMs: 20000,
      order: 4,
    },
    // ── SQL (SQLite, in-memory) ────────────────────────────────────────
    {
      id: "sqlite-3.54",
      language: "sql",
      label: "SQLite 3.54",
      workerKind: "sqlite",
      verified: true,
      features: { stdin: false },
      runtimeBasePath: "/runtimes/sqlite-wasm/",
      disposeAfterRun: false,
      defaultTimeoutMs: 10000,
      order: 1,
    },
    // ── JavaScript ─────────────────────────────────────────────────────
    {
      id: "javascript-browser",
      language: "javascript",
      label: "JavaScript",
      workerKind: "javascript",
      verified: true,
      features: { stdin: false },
      disposeAfterRun: true,
      defaultTimeoutMs: 5000,
      order: 1,
    },
    // ── TypeScript ─────────────────────────────────────────────────────
    {
      id: "typescript-5.9",
      language: "typescript",
      label: "TypeScript 5.9",
      workerKind: "typescript",
      verified: true,
      features: { stdin: false },
      disposeAfterRun: true,
      defaultTimeoutMs: 8000,
      order: 1,
    },
    // ── Ruby ───────────────────────────────────────────────────────────
    {
      id: "ruby-3.4",
      language: "ruby",
      label: "Ruby 3.4",
      workerKind: "ruby",
      verified: true,
      features: { stdin: false },
      runtimeBasePath: "/runtimes/ruby/3.4/",
      disposeAfterRun: false,
      defaultTimeoutMs: 20000,
      order: 1,
    },
  ];

  /** Languages the desktop client executes locally (bundled runtimes). */
  const ENGINE_LANGUAGES = [
    "python",
    "sql",
    "ruby",
    "javascript",
    "typescript",
  ];

  /** Compiled languages — executed by the server's built-in toolchains. */
  const NATIVE_LANGUAGES = ["c", "cpp", "java"];

  function normLang(lang) {
    return String(lang || "").trim().toLowerCase();
  }

  function isEngineLanguage(lang) {
    return ENGINE_LANGUAGES.includes(normLang(lang));
  }

  function isNativeLanguage(lang) {
    return NATIVE_LANGUAGES.includes(normLang(lang));
  }

  /** First verified profile for a language (web parity: default choice). */
  function getDefaultEngineProfile(lang) {
    const l = normLang(lang);
    const profiles = ENGINE_PROFILES.filter((p) => p.language === l);
    return profiles.find((p) => p.verified) || profiles[0] || null;
  }

  /* ======================= execution manager ======================== */

  const MIN_TIMEOUT_MS = 100;
  const MAX_TIMEOUT_MS = 180000;

  /**
   * Worker pool keyed by worker kind — same run protocol as the web
   * app's execution manager:
   *   request  { type:"run", executionId, language, versionProfileId,
   *              code, stdin, timeoutMs, runtimeBasePath }
   *   response { type:"result", executionId, stdout, stderr, … }
   *          | { type:"error",  executionId, message, stage }
   */
  class DesktopExecutionManager {
    constructor() {
      this.workers = new Map();
      this.pending = new Map();
      this.seq = 0;
    }

    workerUrl(kind) {
      return "atomcode://renderer/workers/" + kind + ".worker.js";
    }

    obtainWorker(kind) {
      const existing = this.workers.get(kind);
      if (existing) return existing;

      const worker = new Worker(this.workerUrl(kind), { type: "module" });
      worker.onmessage = (event) => this.handleWorkerMessage(event.data, kind);
      worker.onerror = (event) => {
        this.rejectAllPending(
          new Error((event && event.message) || "Worker failed.")
        );
        this.terminateWorker(kind);
      };
      worker.onmessageerror = () => {
        this.rejectAllPending(new Error("Worker message error."));
        this.terminateWorker(kind);
      };
      this.workers.set(kind, worker);
      return worker;
    }

    handleWorkerMessage(response, workerKind) {
      const entry = this.pending.get(response.executionId);
      if (!entry) return; // late response from an aborted execution
      this.pending.delete(response.executionId);
      clearTimeout(entry.timer);

      if (response.type === "result") {
        entry.resolve(response);
        // Fresh execution context for cheap runtimes so global state
        // never leaks between runs (web parity).
        if (entry.disposeAfterRun) this.terminateWorker(workerKind);
      } else {
        // Compile/execute errors leave the runtime usable — keep it.
        entry.reject(new Error(response.message || "Execution failed."));
      }
    }

    rejectAllPending(error) {
      for (const [executionId, entry] of this.pending) {
        clearTimeout(entry.timer);
        entry.reject(error);
        this.pending.delete(executionId);
      }
    }

    terminateWorker(kind) {
      const worker = this.workers.get(kind);
      if (worker) {
        worker.terminate();
        this.workers.delete(kind);
      }
    }

    /** Execute code with a profile → Promise<RunResult>. */
    run(profile, input) {
      return new Promise((resolve, reject) => {
        if (!profile || !profile.verified || !profile.workerKind) {
          reject(
            new Error(
              (profile && profile.label
                ? profile.label + " runtime"
                : "Runtime") + " is not configured in this build."
            )
          );
          return;
        }

        const executionId =
          "exec-" + Date.now().toString(36) + "-" + ++this.seq;
        const timeoutMs = Math.min(
          Math.max(input.timeoutMs || profile.defaultTimeoutMs, MIN_TIMEOUT_MS),
          MAX_TIMEOUT_MS
        );

        let worker;
        try {
          worker = this.obtainWorker(profile.workerKind);
        } catch (err) {
          reject(
            new Error(
              "Failed to start the " +
                profile.label +
                " runtime: " +
                (err && err.message ? err.message : err)
            )
          );
          return;
        }

        const timer = setTimeout(() => {
          this.pending.delete(executionId);
          // Terminate the runtime — the only reliable way to stop a
          // synchronous infinite loop inside it.
          this.terminateWorker(profile.workerKind);
          reject(new Error("Execution timed out."));
        }, timeoutMs);

        this.pending.set(executionId, {
          resolve,
          reject,
          timer,
          disposeAfterRun: Boolean(profile.disposeAfterRun),
        });

        worker.postMessage({
          type: "run",
          executionId,
          language: profile.language,
          versionProfileId: profile.id,
          code: input.code,
          stdin: input.stdin || "",
          timeoutMs,
          runtimeBasePath: profile.runtimeBasePath,
        });
      });
    }

    disposeAll() {
      for (const kind of [...this.workers.keys()]) this.terminateWorker(kind);
    }
  }

  /* ============================== judge ============================= */

  /** Web-parity output comparison (trailing whitespace / CRLF tolerant). */
  function normalizeOutput(value) {
    return String(value == null ? "" : value)
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/g, ""))
      .join("\n")
      .replace(/\n+$/g, "")
      .trim();
  }

  /** Mirrors wasm-judge.ts renderOutput (SQL text rendering). */
  function renderOutput(result) {
    if (result.sql) {
      if (result.sql.columns.length === 0) {
        return result.stdout || "Statement executed successfully.";
      }
      return result.stdout;
    }
    return result.stdout;
  }

  const manager = new DesktopExecutionManager();

  /**
   * Run one program once against optional expected output.
   * Resolves { compileMessage, output, stderr, timedOut, durationMs } —
   * the same judge contract as the web app's judgeRunSingle.
   */
  async function judgeRunSingle(opts) {
    const profile = getDefaultEngineProfile(opts.lang);
    if (!profile) {
      return {
        compileMessage: "Error",
        output: 'No runtime is configured for "' + opts.lang + '".',
        stderr: 'No runtime is configured for "' + opts.lang + '".',
        timedOut: false,
        durationMs: 0,
      };
    }

    try {
      const result = await manager.run(profile, {
        code: opts.code,
        stdin: opts.input || "",
        timeoutMs: opts.timeoutMs,
      });

      const output = renderOutput(result);
      const compileMessage =
        opts.expectedOutput == null ||
        normalizeOutput(output) === normalizeOutput(opts.expectedOutput)
          ? "Success"
          : "Failed";

      return {
        compileMessage,
        output,
        stderr: result.stderr || "",
        timedOut: false,
        durationMs: result.executionTimeMs || 0,
      };
    } catch (error) {
      const timedOut =
        error instanceof Error && error.message === "Execution timed out.";
      const message =
        error instanceof Error ? error.message : String(error) || "Execution failed.";
      return {
        compileMessage: "Error",
        output: timedOut ? "Execution timed out." : message,
        stderr: message,
        timedOut,
        durationMs: 0,
      };
    }
  }

  /**
   * Multi-test-case judging — mirrors the desktop server route
   * (/api/desktop/run mode:"tests"): cases 2..3 with no input AND no
   * expected output are placeholders and auto-pass.
   */
  async function judgeRunTestCases(opts) {
    const outcomes = [];
    const cases = opts.cases || [];

    for (let index = 0; index < cases.length; index++) {
      const testCase = cases[index];
      const input = testCase.input || "";
      const expected = testCase.expected || "";

      if (index > 0 && input === "" && expected === "") {
        outcomes.push({ status: "Success", output: "" });
        continue;
      }
      if (outcomes.some((o) => o.status === "Error")) {
        // Runtime already broken — report Error without re-running.
        outcomes.push({ status: "Error", output: "" });
        continue;
      }

      const outcome = await judgeRunSingle({
        lang: opts.lang,
        code: opts.code,
        input,
        expectedOutput: expected,
        timeoutMs: opts.timeoutMs,
      });
      outcomes.push({ status: outcome.compileMessage, output: outcome.output });
    }

    return outcomes;
  }

  /* ============================ exports ============================= */

  window.AtomEngine = {
    ENGINE_PROFILES,
    ENGINE_LANGUAGES,
    NATIVE_LANGUAGES,
    isEngineLanguage,
    isNativeLanguage,
    getDefaultEngineProfile,
    manager,
    normalizeOutput,
    judgeRunSingle,
    judgeRunTestCases,
    disposeAll: () => manager.disposeAll(),
  };
})();
