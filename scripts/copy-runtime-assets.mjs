#!/usr/bin/env node
/**
 * copy-runtime-assets.mjs — repopulates public/runtimes/ from pinned
 * npm packages (design doc §15: all runtime assets served from the app's
 * own origin, pinned by exact version).
 *
 * Run after `bun install` (or npm install) whenever runtime packages change:
 *   node scripts/copy-runtime-assets.mjs
 *
 * Layout produced:
 *   public/runtimes/pyodide/<release>/…        (Python 3.11 / 3.12 / 3.13 / 3.14)
 *   public/runtimes/sqlite-wasm/sqlite3.wasm   (official SQLite wasm binary)
 *   public/runtimes/ruby/3.4/ruby+stdlib.wasm  (ruby.wasm CRuby build)
 *   public/runtimes/java/tools.jar             (OpenJDK 8 javac via dataslope-tools-jar)
 *
 * CheerpJ (Java JVM) is fetched in-browser from the pinned v4.2 loader CDN —
 * its .jar payloads are bot-protected against build-time mirroring — while
 * the compilers it needs (tools.jar, ECJ) are self-hosted here.
 */

import { cpSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nm = resolve(root, "node_modules");
const runtimes = resolve(root, "public", "runtimes");

function copyPyodide(release, pythonLabel) {
  const src = resolve(nm, "pyodide");
  const dest = resolve(runtimes, "pyodide", release);
  if (!existsSync(resolve(src, "pyodide.asm.wasm"))) {
    console.warn(`[skip] pyodide ${release} (${pythonLabel}) not installed`);
    return;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`[ok] pyodide ${release} (${pythonLabel}) → ${dest}`);
}

// One pyodide install at a time: install → copy → next. The versions pinned
// here each ship a distinct CPython (see runtime-registry.ts).
copyPyodide("0.25.1", "Python 3.11");
copyPyodide("0.26.4", "Python 3.12");
copyPyodide("0.28.3", "Python 3.13");
copyPyodide("314.0.7", "Python 3.14");

// SQLite official wasm binary (loaded via locateFile from this origin).
{
  const src = resolve(nm, "@sqlite.org", "sqlite-wasm", "dist", "sqlite3.wasm");
  const destDir = resolve(runtimes, "sqlite-wasm");
  if (existsSync(src)) {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, resolve(destDir, "sqlite3.wasm"));
    console.log(`[ok] sqlite-wasm 3.54.1 → ${destDir}`);
  } else {
    console.warn("[skip] @sqlite.org/sqlite-wasm not installed");
  }
}

// Ruby 3.4 (ruby.wasm with bundled stdlib).
{
  const src = resolve(
    nm,
    "@ruby",
    "3.4-wasm-wasi",
    "dist",
    "ruby+stdlib.wasm"
  );
  const destDir = resolve(runtimes, "ruby", "3.4");
  if (existsSync(src)) {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, resolve(destDir, "ruby+stdlib.wasm"));
    console.log(`[ok] ruby.wasm 3.4 → ${destDir}`);
  } else {
    console.warn("[skip] @ruby/3.4-wasm-wasi not installed");
  }
}

// OpenJDK 8 tools.jar (javac) used by the CheerpJ Java worker.
{
  const src = resolve(nm, "dataslope-tools-jar", "tools.jar");
  const destDir = resolve(runtimes, "java");
  if (existsSync(src)) {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, resolve(destDir, "tools.jar"));
    console.log(`[ok] tools.jar (javac 8) → ${destDir}`);
  } else {
    console.warn("[skip] dataslope-tools-jar not installed");
  }
}

// ECJ batch compiler for Java 11/17 targets (self-hosted, downloaded from
// Maven Central once; kept in the repo).
console.log("[info] ECJ jars under public/runtimes/ecj/ are committed assets.");
console.log("[done] runtime assets synced.");
