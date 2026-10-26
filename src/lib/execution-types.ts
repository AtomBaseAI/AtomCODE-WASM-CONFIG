/**
 * Shared execution protocol between the UI (execution manager) and every
 * language runtime worker.
 *
 * Per the WebAssembly Playground design doc (§6): every worker uses the same
 * request/response contract so the UI never needs language-specific logic.
 *
 * Protocol rules:
 * - Every execution receives a unique ID.
 * - Compilation errors go to a structured error response (stage "compile").
 * - Runtime output goes to stdout; runtime diagnostics go to stderr.
 * - The UI owns the execution timeout and can terminate the worker.
 * - A worker must not execute code for a profile whose assets are not verified.
 * - Stdin is explicit — browser prompt() is never used.
 */

import type { LanguageId } from "./runtime-registry";

export interface RunRequest {
  type: "run";
  executionId: string;
  language: LanguageId;
  versionProfileId: string;
  code: string;
  /** Explicit stdin fed to the program (empty string when not provided). */
  stdin?: string;
  timeoutMs?: number;
  /**
   * Origin-relative base path of the pinned runtime assets for this profile,
   * e.g. "/runtimes/pyodide/0.28.3/". Workers load runtimes from the app's
   * own origin. Native-server profiles don't need it.
   */
  runtimeBasePath?: string;
}

export interface SqlQueryPayload {
  columns: string[];
  rows: (string | null)[][];
  changes?: number;
}

export interface RunResult {
  type: "result";
  executionId: string;
  stdout: string;
  stderr: string;
  compileTimeMs?: number;
  executionTimeMs?: number;
  exitCode?: number;
  /** SQLite only: structured query result for grid rendering. */
  sql?: SqlQueryPayload;
}

export interface RunError {
  type: "error";
  executionId: string;
  message: string;
  stage: "loading" | "compile" | "execute";
}

export type WorkerResponse = RunResult | RunError;
