/**
 * Ruby worker — CRuby 3.4 compiled to WebAssembly via ruby.wasm
 * (design doc §12).
 *
 * - The pinned `ruby+stdlib.wasm` build is fetched from this app's own
 *   origin (/runtimes/ruby/3.4/) and compiled once per browser session.
 * - stdout/stderr are captured through ruby.wasm's console printer overlay.
 * - WASI networking/threading constraints apply; stdin is not wired for the
 *   browser build (features.stdin=false in the registry).
 * - Ruby exceptions reject with the formatted message → judge "Error".
 */

import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";
import type {
  RunRequest,
  RunResult,
  WorkerResponse,
} from "../lib/execution-types";

type VM = { eval: (code: string) => unknown; evalAsync?: (code: string) => Promise<unknown> };

let vmPromise: Promise<VM> | null = null;

function getVM(basePath: string): Promise<VM> {
  vmPromise ??= (async () => {
    const wasmUrl = new URL("ruby+stdlib.wasm", new URL(basePath, self.location.origin).href)
      .href;
    const wasmResponse = await fetch(wasmUrl);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch Ruby runtime (${wasmResponse.status}).`);
    }
    const wasmModule = await WebAssembly.compileStreaming(wasmResponse);
    // consolePrint routes Ruby $stdout/$stderr onto console.log/warn — the
    // handlers below capture them per run.
    const { vm } = await DefaultRubyVM(wasmModule, { consolePrint: true });
    return vm as unknown as VM;
  })().catch((error: unknown) => {
    vmPromise = null;
    throw error;
  });
  return vmPromise;
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const request = event.data;
  if (request.type !== "run") return;

  const started = performance.now();

  const stdout: string[] = [];
  const stderr: string[] = [];

  const originalLog = console.log;
  const originalWarn = console.warn;

  try {
    if (!request.runtimeBasePath) {
      throw new Error("Ruby profile is missing its runtime base path.");
    }

    console.log = (...args: unknown[]) => {
      stdout.push(args.map(String).join(" ") + "\n");
    };
    console.warn = (...args: unknown[]) => {
      stderr.push(args.map(String).join(" ") + "\n");
    };

    const vm = await getVM(request.runtimeBasePath);
    if (vm.evalAsync) {
      await vm.evalAsync(request.code);
    } else {
      vm.eval(request.code);
    }

    console.log = originalLog;
    console.warn = originalWarn;

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
    console.log = originalLog;
    console.warn = originalWarn;

    const response: WorkerResponse = {
      type: "error",
      executionId: request.executionId,
      message:
        (error instanceof Error ? error.message : String(error)) ||
        "Ruby runtime failed.",
      stage: "execute",
    };
    self.postMessage(response);
  }
};
