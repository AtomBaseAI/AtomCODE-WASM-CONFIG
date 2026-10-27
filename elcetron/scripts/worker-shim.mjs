/**
 * worker-shim.mjs — runs one desktop runtime worker bundle inside a Node
 * worker thread with a browser-worker-compatible surface:
 *
 *   self / postMessage / location.origin / onmessage
 *
 * The bundle is imported through the harness HTTP origin; a module-loader
 * hook maps that origin onto the renderer directory so dynamic imports
 * (pyodide.mjs, …) resolve exactly like they do under Electron's
 * atomcode:// scheme.
 */

import { parentPort, workerData } from "node:worker_threads";
import { registerHooks } from "node:module";
import vm from "node:vm";
import fsSync from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_ROOT = path.resolve(here, "..", "renderer");
const ORIGIN = workerData.origin;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(ORIGIN + "/")) {
      const rel = decodeURIComponent(specifier.slice(ORIGIN.length));
      const abs = path.normalize(path.join(RENDERER_ROOT, rel));
      if (!abs.startsWith(RENDERER_ROOT + path.sep)) {
        throw new Error("Blocked path outside renderer: " + specifier);
      }
      return { url: pathToFileURL(abs).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

// Mirror the production browser-worker environment: a real URL location,
// importScripts (pyodide's worker-environment signal), self, and no Node
// `process` (pyodide takes its fs-based loader when it detects
// process.versions.node, which cannot resolve origin-relative runtime URLs).
globalThis.location = new URL(ORIGIN + "/");
globalThis.self = globalThis;
globalThis.postMessage = (msg) => parentPort.postMessage(msg);
// Classic-script importScripts — MUST be synchronous (browser semantics:
// pyodide calls it without awaiting). Scripts are read straight from the
// renderer directory and evaluated with true script semantics so the
// emscripten glue's `_createPyodideModule` var becomes a real global.
globalThis.importScripts = (...urls) => {
  for (const raw of urls) {
    const u = new URL(String(raw), globalThis.location).href;
    if (!u.startsWith(ORIGIN + "/")) {
      throw new Error("importScripts shim only supports harness origin URLs: " + u);
    }
    const rel = decodeURIComponent(u.slice(ORIGIN.length));
    const abs = path.normalize(path.join(RENDERER_ROOT, rel));
    if (!abs.startsWith(RENDERER_ROOT + path.sep)) {
      throw new Error("Blocked importScripts outside renderer: " + u);
    }
    const text = fsSync.readFileSync(abs, "utf8");
    vm.runInThisContext(text, { filename: abs });
  }
};

try {
  delete globalThis.process;
} catch {
  Object.defineProperty(globalThis, "process", { value: undefined });
}

const target = workerData.target.startsWith(ORIGIN)
  ? workerData.target
  : ORIGIN + workerData.target;

await import(target);

parentPort.on("message", (data) => {
  if (typeof globalThis.onmessage === "function") {
    globalThis.onmessage({ data });
  }
});
