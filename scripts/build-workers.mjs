#!/usr/bin/env node
/**
 * build-workers.mjs — bundles the language runtime workers (src/workers/*)
 * into self-contained ES-module files under public/workers/ using bun.
 *
 * Next.js's webpack does not compile `new Worker(new URL("./x.ts",
 * import.meta.url))` entries (it emits the raw .ts as a static asset), so
 * the design doc's own layout is used instead: workers live in
 * public/workers/ and are constructed with `new Worker(url, {type:"module"})`.
 *
 * Run after changing any worker or runtime dependency:
 *   bun run workers:build
 */

import { $ } from "bun";

const entries = [
  "src/workers/javascript.worker.ts",
  "src/workers/typescript.worker.ts",
  "src/workers/python.worker.ts",
  "src/workers/sqlite.worker.ts",
  "src/workers/ruby.worker.ts",
];

await $`bun build ${entries} --outdir public/workers --entry-naming "[name].js" --format esm --target browser --minify --define global=globalThis`;

console.log("[done] workers bundled → public/workers/");
