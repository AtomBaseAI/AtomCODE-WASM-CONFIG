/**
 * selftest.js — headless end-to-end test of the desktop built-in engine.
 *
 * Launches the real Electron app shell (atomcode://renderer/index.html),
 * then drives window.AtomEngine exactly like the UI does:
 *   - Python / SQL / JavaScript / TypeScript / Ruby run in the bundled
 *     runtime workers loaded through the atomcode:// protocol
 *   - judging (expected-output comparison) and the test-case contract
 *
 * Run:  cd elcetron && xvfb-run -a npx electron scripts/selftest.js
 */

const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs/promises");

app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-dev-shm-usage");
app.commandLine.appendSwitch("no-zygote");
app.commandLine.appendSwitch("single-process");

const RENDERER_ROOT = path.join(__dirname, "..", "renderer");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: "atomcode",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      codeCache: true,
    },
  },
]);

function serveRenderer(request) {
  const parsed = new URL(request.url);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === "/" || pathname === "") pathname = "/index.html";
  const filePath = path.normalize(path.join(RENDERER_ROOT, pathname));
  if (!filePath.startsWith(RENDERER_ROOT + path.sep)) {
    return Promise.resolve(new Response("Forbidden", { status: 403 }));
  }
  return fs
    .readFile(filePath)
    .then((buf) =>
      new Response(buf, {
        status: 200,
        headers: {
          "content-type":
            MIME_TYPES[path.extname(filePath).toLowerCase()] ||
            "application/octet-stream",
        },
      })
    )
    .catch((err) =>
      new Response(err.code === "ENOENT" ? "Not found" : "Error", {
        status: err.code === "ENOENT" ? 404 : 500,
      })
    );
}

const IN_PAGE_TEST = `(async () => {
  const out = { origin: location.origin, hasEngine: !!window.AtomEngine };
  const E = window.AtomEngine;
  if (!E) return out;

  // 0 — protocol serving + MIME checks
  const idx = await fetch("/index.html");
  out.protocol = { index: idx.status, type: idx.headers.get("content-type") };
  const wasm = await fetch("/runtimes/sqlite-wasm/sqlite3.wasm");
  out.wasmMime = { status: wasm.status, type: wasm.headers.get("content-type") };
  const workerJs = await fetch("/workers/python.worker.js");
  out.workerJs = { status: workerJs.status, type: workerJs.headers.get("content-type") };

  // 1 — Python: plain run
  out.python = await E.judgeRunSingle({ lang: "python", code: 'print("Hello from Python!")' });
  // 2 — Python: expected output pass + fail
  out.pythonPass = (await E.judgeRunSingle({ lang: "python", code: 'print("hi")', expectedOutput: "hi" })).compileMessage;
  out.pythonFail = (await E.judgeRunSingle({ lang: "python", code: 'print("hi")', expectedOutput: "bye" })).compileMessage;
  // 3 — Python: stdin
  out.pythonStdin = await E.judgeRunSingle({ lang: "python", code: "import sys; print(sys.stdin.read().strip().upper())", input: "atom" });

  // 4 — SQL grid
  out.sql = await E.judgeRunSingle({ lang: "sql", code: "CREATE TABLE t(a INTEGER); INSERT INTO t VALUES (41),(1); SELECT SUM(a) AS total FROM t;" });

  // 5 — JavaScript
  out.javascript = await E.judgeRunSingle({ lang: "javascript", code: 'console.log("JS OK");' });

  // 6 — TypeScript (transpile + run)
  out.typescript = await E.judgeRunSingle({ lang: "typescript", code: 'const n: number = 21; console.log("TS", n * 2);' });

  // 7 — Ruby
  out.ruby = await E.judgeRunSingle({ lang: "ruby", code: 'puts "Ruby OK"' });

  // 8 — multi test-case contract (placeholder auto-pass rule)
  const cases = await E.judgeRunTestCases({
    lang: "python",
    code: 'x = int(input()); print(x * 2)',
    cases: [
      { input: "3", expected: "6" },
      { input: "", expected: "" },   // placeholder → auto-pass
      { input: "10", expected: "21" }, // wrong expected → fail
    ],
  });
  out.cases = cases.map((c) => c.status);

  // 9 — default profile registry
  out.defaults = ["python", "sql", "ruby", "javascript", "typescript"]
    .map((l) => E.getDefaultEngineProfile(l)?.id);

  // 10 — infinite loop → timeout + worker eviction
  const t0 = Date.now();
  const to = await E.judgeRunSingle({ lang: "javascript", code: "while(true){}", timeoutMs: 1500 });
  out.timeout = { message: to.output, elapsed: Date.now() - t0 };

  // 11 — runtime survives a rejected execution (worker pool still usable)
  out.afterTimeout = (await E.judgeRunSingle({ lang: "javascript", code: 'console.log("still alive")' })).output;

  return out;
})()`;

app.whenReady().then(async () => {
  protocol.handle("atomcode", serveRenderer);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, "..", "preload.js") },
  });

  let code = 0;
  try {
    await win.loadURL("atomcode://renderer/index.html");
    await win.webContents.executeJavaScript("window.AtomEngine ? true : false", true);
    // wait for engine + app.js boot
    for (let i = 0; i < 40; i++) {
      const ok = await win.webContents.executeJavaScript("!!window.AtomEngine", true);
      if (ok) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    const results = await Promise.race([
      win.webContents.executeJavaScript(IN_PAGE_TEST, true),
      new Promise((_, rej) => setTimeout(() => rej(new Error("in-page test timed out")), 120_000)),
    ]);

    const expect = (cond, label) => {
      const ok = Boolean(cond);
      if (!ok) code = 1;
      console.log((ok ? "PASS" : "FAIL") + "  " + label);
      return ok;
    };

    console.log(JSON.stringify(results, null, 2));
    expect(results.hasEngine, "engine loaded on atomcode:// page");
    expect(results.protocol?.index === 200, "index.html served over atomcode://");
    expect(String(results.wasmMime?.type || "").includes("application/wasm"), "wasm MIME = application/wasm");
    expect(results.python?.output?.trim() === "Hello from Python!", "Python executes locally");
    expect(results.pythonPass === "Success", "Python expected-output pass");
    expect(results.pythonFail === "Failed", "Python expected-output fail");
    expect(results.pythonStdin?.output?.trim() === "ATOM", "Python stdin works");
    expect(results.sql?.output?.includes("42"), "SQL grid output (SUM=42)");
    expect(results.javascript?.output?.trim() === "JS OK", "JavaScript executes");
    expect(results.typescript?.output?.trim() === "TS 42", "TypeScript transpile+run");
    expect(results.ruby?.output?.trim() === "Ruby OK", "Ruby executes");
    expect(
      results.cases?.[0] === "Success" && results.cases?.[1] === "Success" && results.cases?.[2] === "Failed",
      "test-case statuses (Success/Success/Failed)"
    );
    expect(results.defaults?.join(",") === "python-3.11,sqlite-3.54,ruby-3.4,javascript-browser,typescript-5.9", "default profiles per language");
    expect(results.timeout?.message === "Execution timed out." && results.timeout.elapsed < 8000, "infinite loop terminates");
    expect(results.afterTimeout === "still alive", "worker pool recovers after timeout");
  } catch (err) {
    code = 1;
    console.error("SELFTEST ERROR:", err);
  } finally {
    app.exit(code);
  }
});
