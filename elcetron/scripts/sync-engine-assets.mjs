#!/usr/bin/env node
/**
 * sync-engine-assets.mjs — packages the web app's built-in code execution
 * engine into the Electron desktop client.
 *
 * Copies (from the repo root, ../ relative to this folder):
 *   public/workers/*.worker.js        → renderer/workers/
 *   public/runtimes/pyodide/**        → renderer/runtimes/pyodide/
 *   public/runtimes/sqlite-wasm/**    → renderer/runtimes/sqlite-wasm/
 *   public/runtimes/ruby/**           → renderer/runtimes/ruby/
 *
 * The Java bridge assets (public/runtimes/{cheerpj,ecj,java}) are NOT
 * copied — the desktop client executes C/C++/Java on the connected
 * AtomCode server's built-in toolchains via /api/desktop/run.
 *
 * Run from elcetron/:  node scripts/sync-engine-assets.mjs
 * (or: bun run sync:engine)
 */

import { cpSync, existsSync, rmSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const electronRoot = path.resolve(here, "..");
const webRoot = path.resolve(electronRoot, "..");
const renderer = path.join(electronRoot, "renderer");

const jobs = [
  { from: path.join(webRoot, "public", "workers"), to: path.join(renderer, "workers") },
  { from: path.join(webRoot, "public", "runtimes", "pyodide"), to: path.join(renderer, "runtimes", "pyodide") },
  { from: path.join(webRoot, "public", "runtimes", "sqlite-wasm"), to: path.join(renderer, "runtimes", "sqlite-wasm") },
  { from: path.join(webRoot, "public", "runtimes", "ruby"), to: path.join(renderer, "runtimes", "ruby") },
];

for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.warn(`[sync] missing source, skipped: ${from}`);
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`[sync] ${path.relative(webRoot, from)} → ${path.relative(webRoot, to)}`);
}

console.log("[done] desktop engine assets are in sync with the web app");
