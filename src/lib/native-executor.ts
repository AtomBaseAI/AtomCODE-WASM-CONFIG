/**
 * Native execution engine — server-only (design doc §13 "wasm-compiler"
 * row, realized with the machine's own built-in toolchains).
 *
 * The C/C++ interpreter previously used here (JSCPP) could not parse real
 * C++ (`std::cout` — its grammar has no `::` scope-resolution operator), so
 * C, C++ and Java now execute with the server's built-in toolchains instead:
 *
 *   C    → gcc   (-std=c99 | c11 | c17)
 *   C++  → g++   (-std=c++11 | c++14 | c++17 | c++20)
 *   Java → ECJ (self-hosted batch compiler jar) + the OpenJDK 21 JVM
 *
 * No external execution API or key is involved — everything runs on the
 * AtomCode server itself, inside a private per-run temp directory that is
 * always removed afterwards.
 *
 * Execution model per run:
 *   1. compile into the temp dir (hard 30 s budget),
 *   2. execute the produced artifact with explicit stdin and a hard
 *      process-group kill on timeout (so even forked children die),
 *   3. capture stdout/stderr/exit code (mirrors the judge contract).
 */

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

/* ────────────────────────────── targets ─────────────────────────────── */

export const NATIVE_LANGUAGES = ["c", "cpp", "java"] as const;
export type NativeLanguage = (typeof NATIVE_LANGUAGES)[number];

export interface NativeTargetSpec {
  language: NativeLanguage;
  /** C/C++: value of the -std= flag. */
  std?: string;
  /** Java: -source/-target level. */
  javaLevel?: string;
  /** Java: self-hosted ECJ batch-compiler jar (under public/runtimes/ecj/). */
  ecj?: string;
}

/** profileId → toolchain invocation. Keys mirror runtime-registry ids. */
export const NATIVE_TARGETS: Record<string, NativeTargetSpec> = {
  "c-c99": { language: "c", std: "c99" },
  "c-c11": { language: "c", std: "c11" },
  "c-c17": { language: "c", std: "c17" },
  "cpp-cpp11": { language: "cpp", std: "c++11" },
  "cpp-cpp14": { language: "cpp", std: "c++14" },
  "cpp-cpp17": { language: "cpp", std: "c++17" },
  "cpp-cpp20": { language: "cpp", std: "c++20" },
  "java-8": { language: "java", javaLevel: "8", ecj: "ecj-3.27.0.jar" },
  "java-11": { language: "java", javaLevel: "11", ecj: "ecj-3.27.0.jar" },
  "java-17": { language: "java", javaLevel: "17", ecj: "ecj-3.33.0.jar" },
};

/** Blind defaults (desktop client has no version selector). */
export const DEFAULT_NATIVE_TARGETS: Record<NativeLanguage, string> = {
  c: "c-c17",
  cpp: "cpp-cpp17",
  java: "java-17",
};

/* ────────────────────────────── limits ──────────────────────────────── */

const MAX_CODE_CHARS = 200_000;
const MAX_STDIN_CHARS = 1_000_000;
const MAX_STREAM_CHARS = 200_000;
const COMPILE_TIMEOUT_MS = 30_000;
const MIN_RUN_TIMEOUT_MS = 1_000;
const MAX_RUN_TIMEOUT_MS = 60_000;

/* ───────────────────────────── outcomes ─────────────────────────────── */

export interface NativeSuccess {
  ok: true;
  stdout: string;
  stderr: string;
  exitCode: number;
  compileTimeMs: number;
  executionTimeMs: number;
}

export interface NativeFailure {
  ok: false;
  stage: "compile" | "execute" | "toolchain";
  message: string;
  timedOut?: boolean;
}

export type NativeOutcome = NativeSuccess | NativeFailure;

/* ─────────────────────── process-group runner ───────────────────────── */

interface ProcResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  spawnError?: string;
}

function runProcess(
  command: string,
  args: string[],
  opts: { cwd: string; input?: string; timeoutMs: number }
): Promise<ProcResult> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let killedByTimeout = false;

    let child;
    try {
      // detached → own process group, so a timeout kill wipes the whole tree
      child = spawn(command, args, {
        cwd: opts.cwd,
        stdio: ["pipe", "pipe", "pipe"],
        detached: true,
      });
    } catch {
      resolve({
        stdout: "",
        stderr: "",
        exitCode: null,
        timedOut: false,
        spawnError: `Failed to launch ${command}.`,
      });
      return;
    }

    const killTree = () => {
      try {
        if (child.pid) process.kill(-child.pid, "SIGKILL");
      } catch {
        try {
          child.kill("SIGKILL");
        } catch {
          /* already gone */
        }
      }
    };

    const timer = setTimeout(() => {
      killedByTimeout = true;
      killTree();
    }, opts.timeoutMs);

    const append = (target: "out" | "err", chunk: Buffer | string) => {
      const text = typeof chunk === "string" ? chunk : chunk.toString("utf8");
      if (target === "out" && stdout.length < MAX_STREAM_CHARS)
        stdout += text;
      if (target === "err" && stderr.length < MAX_STREAM_CHARS) stderr += text;
    };

    child.stdout?.on("data", (chunk: Buffer) => append("out", chunk));
    child.stderr?.on("data", (chunk: Buffer) => append("err", chunk));
    child.on("error", (err: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: null,
        timedOut: false,
        spawnError:
          err.code === "ENOENT"
            ? `${command} is not available on this server.`
            : `Failed to run ${command}: ${err.message}`,
      });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code,
        timedOut: killedByTimeout,
      });
    });

    // Feed stdin; the program may exit without reading it (EPIPE) — ignore.
    try {
      child.stdin?.on("error", () => {});
      child.stdin?.write(opts.input ?? "");
      child.stdin?.end();
    } catch {
      /* stdin unavailable */
    }
  });
}

/* ──────────────────────────── java helpers ──────────────────────────── */

function detectMainClass(code: string): string {
  const pkgMatch = code.match(/(^|\n)\s*package\s+([\w.]+)\s*;/);
  const pkg = pkgMatch ? pkgMatch[2] + "." : "";
  const classRe =
    /(?:public\s+)?(?:final\s+|abstract\s+)*class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:extends\s+[\w.]+|implements\s+[\w.,\s]+)?\s*\{/g;
  let match: RegExpExecArray | null;
  let fallback: string | null = null;
  while ((match = classRe.exec(code)) !== null) {
    const rest = code.slice(classRe.lastIndex, classRe.lastIndex + 800);
    if (/static[\s\S]{0,200}?void[\s\S]{0,40}?main\s*\(/.test(rest)) {
      return pkg + match[1];
    }
    if (fallback === null) fallback = match[1];
  }
  return pkg + (fallback || "Main");
}

/** The public top-level type — its file-name rule must be respected. */
function detectPublicTypeName(code: string): string | null {
  const m = code.match(
    /(^|\n)\s*public\s+(?:final\s+|abstract\s+|sealed\s+|non\s+sealed\s+|static\s+)*(?:class|enum|interface|record)\s+([A-Za-z_$][A-Za-z0-9_$]*)/
  );
  return m ? m[2] : null;
}

/* ─────────────────────────── toolchain paths ────────────────────────── */

function ecjJarPath(jar: string): string {
  return path.join(process.cwd(), "public", "runtimes", "ecj", jar);
}

/* ────────────────────────────── executor ────────────────────────────── */

export async function executeNative(params: {
  profileId?: string | null;
  language: string;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<NativeOutcome> {
  const language = params.language as NativeLanguage;
  if (!NATIVE_LANGUAGES.includes(language)) {
    return {
      ok: false,
      stage: "toolchain",
      message: `Language "${params.language}" has no built-in native execution target.`,
    };
  }

  const spec =
    (params.profileId ? NATIVE_TARGETS[params.profileId] : undefined) ??
    NATIVE_TARGETS[DEFAULT_NATIVE_TARGETS[language]];

  if (params.code.length > MAX_CODE_CHARS) {
    return {
      ok: false,
      stage: "compile",
      message: `Source too large (limit ${MAX_CODE_CHARS} characters).`,
    };
  }
  if ((params.stdin ?? "").length > MAX_STDIN_CHARS) {
    return {
      ok: false,
      stage: "execute",
      message: `Custom input too large (limit ${MAX_STDIN_CHARS} characters).`,
    };
  }

  const runTimeoutMs = Math.min(
    Math.max(params.timeoutMs ?? 10_000, MIN_RUN_TIMEOUT_MS),
    MAX_RUN_TIMEOUT_MS
  );

  const dir = await mkdtemp(path.join(tmpdir(), "atomcode-exec-"));
  try {
    if (language === "c" || language === "cpp") {
      return await runClangFamily(dir, spec, params, runTimeoutMs);
    }
    return await runJava(dir, spec, params, runTimeoutMs);
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function runClangFamily(
  dir: string,
  spec: NativeTargetSpec,
  params: { code: string; stdin?: string },
  runTimeoutMs: number
): Promise<NativeOutcome> {
  const isC = spec.language === "c";
  const compiler = isC ? "gcc" : "g++";
  const sourceFile = isC ? "main.c" : "main.cpp";
  await writeFile(path.join(dir, sourceFile), params.code, "utf8");

  const compileStart = performance.now();
  const compileArgs = [
    `-std=${spec.std ?? (isC ? "c17" : "c++17")}`,
    "-O0",
    "-pipe",
    "-o",
    "./program",
    sourceFile,
    ...(isC ? ["-lm"] : []),
  ];
  const compile = await runProcess(compiler, compileArgs, {
    cwd: dir,
    timeoutMs: COMPILE_TIMEOUT_MS,
  });

  if (compile.spawnError) {
    return {
      ok: false,
      stage: "toolchain",
      message: `Built-in ${compiler} toolchain is unavailable: ${compile.spawnError}`,
    };
  }
  if (compile.exitCode !== 0) {
    return {
      ok: false,
      stage: "compile",
      message:
        compile.stderr.trim() ||
        `Compilation failed (exit code ${compile.exitCode ?? "unknown"}).`,
    };
  }
  const compileTimeMs = performance.now() - compileStart;

  const runStart = performance.now();
  const run = await runProcess("./program", [], {
    cwd: dir,
    input: params.stdin ?? "",
    timeoutMs: runTimeoutMs,
  });

  if (run.spawnError) {
    return {
      ok: false,
      stage: "toolchain",
      message: run.spawnError,
    };
  }
  if (run.timedOut) {
    return {
      ok: false,
      stage: "execute",
      message: "Execution timed out.",
      timedOut: true,
    };
  }

  return {
    ok: true,
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.exitCode ?? 0,
    compileTimeMs,
    executionTimeMs: performance.now() - runStart,
  };
}

async function runJava(
  dir: string,
  spec: NativeTargetSpec,
  params: { code: string; stdin?: string },
  runTimeoutMs: number
): Promise<NativeOutcome> {
  const level = spec.javaLevel ?? "17";
  const mainClass = detectMainClass(params.code);
  const publicType = detectPublicTypeName(params.code) ?? mainClass.split(".").pop() ?? "Main";

  await writeFile(path.join(dir, `${publicType}.java`), params.code, "utf8");

  const compileStart = performance.now();
  const compile = await runProcess(
    "java",
    [
      "-jar",
      ecjJarPath(spec.ecj ?? "ecj-3.33.0.jar"),
      "-nowarn",
      "-g",
      "-source",
      level,
      "-target",
      level,
      "-d",
      "out",
      `${publicType}.java`,
    ],
    { cwd: dir, timeoutMs: COMPILE_TIMEOUT_MS }
  );

  if (compile.spawnError) {
    return {
      ok: false,
      stage: "toolchain",
      message: `Built-in Java toolchain is unavailable: ${compile.spawnError}`,
    };
  }
  if (compile.exitCode !== 0) {
    return {
      ok: false,
      stage: "compile",
      message:
        compile.stderr.trim() ||
        `Compilation failed (exit code ${compile.exitCode ?? "unknown"}).`,
    };
  }
  const compileTimeMs = performance.now() - compileStart;

  const runStart = performance.now();
  const run = await runProcess(
    "java",
    ["-Dfile.encoding=UTF-8", "-cp", "out", mainClass],
    {
      cwd: dir,
      input: params.stdin ?? "",
      timeoutMs: runTimeoutMs,
    }
  );

  if (run.spawnError) {
    return {
      ok: false,
      stage: "toolchain",
      message: run.spawnError,
    };
  }
  if (run.timedOut) {
    return {
      ok: false,
      stage: "execute",
      message: "Execution timed out.",
      timedOut: true,
    };
  }

  return {
    ok: true,
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.exitCode ?? 0,
    compileTimeMs,
    executionTimeMs: performance.now() - runStart,
  };
}

/* ───────────────────────── output normalization ─────────────────────── */

/**
 * Mirror of the judge's output tolerance: trailing whitespace per line,
 * CR/LF endings and trailing blank lines are normalized away.
 */
export function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();
}

/** Stable execution id for API responses. */
export function newExecutionId(): string {
  return `native-${randomUUID()}`;
}
