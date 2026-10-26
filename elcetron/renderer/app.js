/* ================================================================
 * AtomCode Student Desktop — renderer
 * Faithful port of the web app's student UI (violet shadcn theme)
 * All HTTP via window.atomcode.api (main-process proxy).
 * ================================================================ */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const app = window.atomcode;

const LS = { token: "atomcode.token", user: "atomcode.user", server: "atomcode.server", theme: "atomcode.theme" };

const state = {
  token: null,
  user: null,
  serverUrl: localStorage.getItem(LS.server) || "http://localhost:3000",
  view: "dashboard",
  course: null,        // { id, title }
  moduleCtx: null,     // { cid, mid, detail, courseName, moduleName }
  assessment: null,    // { aid, uaid, detail, timer, remaining, tabCount }
};

/* ============================== icons (lucide) ============================== */
const P = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  calendarCheck: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  calendarX: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m14.5 13.5-5 5"/><path d="m9.5 13.5 5 5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  puzzle: '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  bookIcon: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  fileVideo: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 11 5 3-5 3z"/>',
  fileText: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
  key: '<path d="M2 18v3h3l10.5-10.5a6 6 0 1 0-3-3Z"/><circle cx="17" cy="7" r="1"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  shieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  circleSlash: '<circle cx="12" cy="12" r="10"/><path d="m22 2-20 20"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
  chevRr: '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  chevronsR: '<polyline points="6 17 11 12 6 7"/><polyline points="13 17 18 12 13 7"/>',
};

const icon = (name, cls = "ic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ""}</svg>`;

/* ============================== utils ============================== */

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const initials = (name) =>
  (name || "S").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const fmtSecs = (s) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return (h > 0 ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const langIcon = (lang) => {
  const map = { c: "c.svg", cpp: "cpp.svg", java: "java.svg", python: "python.svg", javascript: "javascript.svg", typescript: "typescript.svg", ruby: "ruby.svg" };
  const file = map[(lang || "").toLowerCase()];
  if (file) return `<img src="assets/Lang/${file}" alt="${esc(lang)} logo" />`;
  return `<span class="fallback">${icon("terminal")}</span>`;
};

function toast(msg, kind = "success") {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${icon(kind === "error" ? "alertCircle" : kind === "warning" ? "shieldAlert" : "checkCircle", "ic")}<span>${esc(msg)}</span>`;
  $("#toast-holder").appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

function dialog(html, { wide = false } = {}) {
  $("#modal-box").className = `modal ${wide ? "wide" : ""}`;
  $("#modal-box").innerHTML = html;
  $("#modal-backdrop").classList.remove("hidden");
}
function closeDialog() {
  $("#modal-backdrop").classList.add("hidden");
  $("#modal-box").innerHTML = "";
}
$("#modal-backdrop").addEventListener("click", (e) => {
  if (e.target.id === "modal-backdrop") closeDialog();
});

function openSheet(html) {
  $("#sheet-box").innerHTML = html;
  $("#sheet-backdrop").classList.remove("hidden");
}
function closeSheet() {
  $("#sheet-backdrop").classList.add("hidden");
  $("#sheet-box").innerHTML = "";
}
$("#sheet-backdrop").addEventListener("click", (e) => {
  if (e.target.id === "sheet-backdrop") closeSheet();
});

/* theme */
function applyTheme(t) {
  document.body.classList.toggle("dark", t === "dark");
  localStorage.setItem(LS.theme, t);
  const btn = $("#theme-toggle");
  if (btn) btn.innerHTML = icon(t === "dark" ? "sun" : "moon");
}
$("#theme-toggle").addEventListener("click", () =>
  applyTheme(document.body.classList.contains("dark") ? "light" : "dark")
);

/* ============================== API ============================== */

async function api(path, { method = "GET", body, silent401 = false } = {}) {
  const res = await app.api({ serverUrl: state.serverUrl, path, method, token: state.token, body });
  if (res && res.status === 401 && !silent401 && state.token) {
    clearSession();
    showLogin("Session expired — please sign in again");
    throw new Error(res.data?.error || "Unauthorized");
  }
  return res;
}

async function apiOrThrow(path, opts) {
  const res = await api(path, opts);
  if (!res.ok) throw new Error(res.data?.error || `Request failed (${res.status})`);
  return res.data;
}

/* ============== built-in code execution (desktop engine) ============== */

const ENGINE_STATUS = { Success: "pass", Failed: "fail", Error: "error" };

/**
 * Executes a question's code with the built-in compilers — the same setup
 * the web app ships:
 * - python/sql/ruby/javascript/typescript run locally in bundled runtimes
 *   (the question's hidden test cases are judged client-side, like the web);
 * - c/cpp/java run on the connected server's built-in toolchains via
 *   POST /api/desktop/run (judged server-side, expected outputs never sent).
 * Both paths return the same response shape, so the calling UI is agnostic.
 */
async function runQuestionCode({ q, code, mode, moduleId, assessmentId }) {
  const lang = String(q.lang || "").toLowerCase();

  if (window.AtomEngine && window.AtomEngine.isEngineLanguage(lang)) {
    if (mode === "sample") {
      const outcome = await window.AtomEngine.judgeRunSingle({
        lang,
        code,
        input: q.sampleinput1 || "",
        expectedOutput: q.sampleoutput1 == null ? null : q.sampleoutput1,
      });
      return {
        mode,
        compileMessage: outcome.compileMessage,
        output: outcome.output,
        passed: outcome.compileMessage === "Success",
      };
    }

    const results = await window.AtomEngine.judgeRunTestCases({
      lang,
      code,
      cases: [
        { input: q.input1, expected: q.output1 },
        { input: q.input2, expected: q.output2 },
        { input: q.input3, expected: q.output3 },
      ],
    });
    const statuses = results.map((r) => ENGINE_STATUS[r.status] || "error");
    return {
      mode,
      compileMessage: statuses.every((s) => s !== "error") ? "Success" : "Error",
      testcase1status: statuses[0],
      testcase2status: statuses[1],
      testcase3status: statuses[2],
      output1: results[0]?.output,
      output2: results[1]?.output,
      output3: results[2]?.output,
      passedCount: statuses.filter((s) => s === "pass").length,
    };
  }

  // Compiled languages → the server's built-in toolchains.
  return apiOrThrow("/run", {
    method: "POST",
    body: {
      questionId: q.id,
      code,
      mode,
      ...(moduleId ? { moduleId } : {}),
      ...(assessmentId ? { assessmentId } : {}),
    },
  });
}

/* ============================== session ============================== */

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem(LS.token);
  localStorage.removeItem(LS.user);
}

function showLogin(notice = null) {
  $("#view-shell").classList.add("hidden");
  $("#view-login").classList.remove("hidden");
  $("#login-server").value = state.serverUrl;
  const err = $("#login-error");
  if (notice) { err.textContent = notice; err.classList.remove("hidden"); }
  else err.classList.add("hidden");
}

function showShell() {
  $("#view-login").classList.add("hidden");
  $("#view-shell").classList.remove("hidden");
  $("#tb-name").textContent = state.user?.name || "Student";
  $("#tb-email").textContent = state.user?.email || "";
  $("#tb-avatar").textContent = initials(state.user?.name);
  navigate("dashboard");
}

async function boot() {
  applyTheme(localStorage.getItem(LS.theme) || "light");
  state.token = localStorage.getItem(LS.token);
  state.user = JSON.parse(localStorage.getItem(LS.user) || "null");
  if (!state.token || !state.user) { showLogin(); return; }

  const res = await api("/auth/me", { silent401: true });
  if (!res.ok) { clearSession(); showLogin("Session expired — please sign in again"); return; }
  state.user = res.data.user;
  localStorage.setItem(LS.user, JSON.stringify(state.user));
  showShell();
}

/* login */
$("#login-btn").addEventListener("click", doLogin);
$("#login-password").addEventListener("keydown", (e) => e.key === "Enter" && doLogin());

async function doLogin() {
  const serverUrl = $("#login-server").value.trim().replace(/\/+$/, "");
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;
  const errEl = $("#login-error");
  if (!/^https?:\/\//i.test(serverUrl)) {
    errEl.textContent = "Server address must start with http:// or https://";
    errEl.classList.remove("hidden");
    return;
  }
  state.serverUrl = serverUrl;
  localStorage.setItem(LS.server, serverUrl);
  const btn = $("#login-btn");
  btn.disabled = true;
  btn.innerHTML = `${icon("loader", "ic spin")} Signing in…`;
  errEl.classList.add("hidden");
  try {
    const res = await api("/auth/login", { method: "POST", body: { email, password } });
    if (!res.ok) {
      errEl.textContent = res.data?.error || "Login failed";
      errEl.classList.remove("hidden");
      return;
    }
    state.token = res.data.token;
    state.user = res.data.user;
    localStorage.setItem(LS.token, state.token);
    localStorage.setItem(LS.user, JSON.stringify(state.user));
    toast(`Welcome back, ${state.user.name || state.user.email}!`);
    showShell();
  } catch (e) {
    errEl.textContent = e.message || "Cannot reach the server";
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

$("#logout-btn").addEventListener("click", () => {
  dialog(`
    <h2 class="dialog-title">Logout</h2>
    <p class="dialog-desc">Are you sure you want to logout from AtomCode Student?</p>
    <div class="dialog-footer">
      <button class="btn btn-destructive" id="m-cancel">Cancel</button>
      <button class="btn btn-primary" id="m-yes">Logout</button>
    </div>`);
  $("#m-cancel").onclick = closeDialog;
  $("#m-yes").onclick = async () => {
    try { await api("/auth/logout", { method: "POST", silent401: true }); } catch {}
    clearSession();
    closeDialog();
    showLogin();
  };
});

/* ============================== router ============================== */

const VIEW_TITLES = { dashboard: "Dashboard", courses: "My Courses", lab: "Labs", assessments: "Assessments", settings: "Settings", modules: "Modules" };

$$(".side-link[data-view]").forEach((btn) =>
  btn.addEventListener("click", () => navigate(btn.dataset.view))
);

function setActiveNav(view) {
  $$(".side-link[data-view]").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view || (view === "modules" && b.dataset.view === "courses") || (view === "practice" && b.dataset.view === "courses"))
  );
}

async function navigate(view, opts = {}) {
  closePractice();
  setActiveNav(view);
  const v = $("#view");
  v.innerHTML = `<div class="loading-state">${icon("loader", "ic spin")} Loading…</div>`;

  const renderers = {
    dashboard: renderDashboard,
    courses: renderCourses,
    modules: renderModules,
    practice: renderPracticeHome,
    lab: renderLab,
    assessments: renderAssessments,
    settings: renderSettings,
  };
  try {
    await (renderers[view] || renderDashboard)(v, opts);
  } catch (e) {
    v.innerHTML = `<div class="alert alert-error mt2">${esc(e.message)}</div>`;
  }
}

/* ============================== dashboard ============================== */

/** Asia/Kolkata "YYYY-MM-DD" day key (mirrors the web calendar). */
function istDayKey(d) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const m = {};
  p.forEach(({ type, value }) => { if (type !== "literal") m[type] = value; });
  return `${m.year}-${m.month}-${m.day}`;
}

async function renderDashboard(v) {
  const [coursesRes] = await Promise.all([api("/student/courses")]);
  if (!coursesRes.ok) throw new Error(coursesRes.data?.error || "Failed to load courses");
  const courses = coursesRes.data.courses;
  const count = courses.length;

  const statCard = (ic, color, num, label) => `
    <div class="stat-card">
      <div class="stat-icon ${color}">${icon(ic, "ic lg")}</div>
      <div><span class="num">${num}</span><span class="lbl">${label}</span></div>
    </div>`;

  v.innerHTML = `
    <div class="w-full flex flex-col gap-2 justify-center items-center" style="width:100%;">
      <section class="stat-grid">
        ${statCard("bookIcon", "purple", count, "Courses Enrolled")}
        ${statCard("clock", "purple", count, "Courses Active")}
        ${statCard("trophy", "green", 0, "Courses Completed")}
      </section>
      <section style="width:100%;">
        <div class="calendar-container">
          <div class="cal-header">
            <h2 id="cal-title">—</h2>
            <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month">${icon("chevL", "ic lg")}</button>
            <button class="cal-nav-btn" id="cal-next" aria-label="Next month">${icon("chevR", "ic lg")}</button>
          </div>
          <div class="cal-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => `<div>${d}</div>`).join("")}</div>
          <div class="cal-days" id="cal-days"></div>
        </div>
      </section>
    </div>`;

  // events: course start (green) / end (red) — dates are dd/mm/yyyy
  const events = courses.flatMap((c) => [
    { title: `${c.courseName} Start`, key: c.courseStartDate.split("/").reverse().join("-"), type: "start" },
    { title: `${c.courseName} End`, key: c.courseEndDate.split("/").reverse().join("-"), type: "end" },
  ]);

  let anchor = new Date();
  let selectedKey = null;

  function paint() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" }).formatToParts(anchor);
    const m = {};
    parts.forEach(({ type, value }) => { if (type !== "literal") m[type] = value; });
    $("#cal-title").textContent = `${m.month} ${m.year}`;

    const viewYear = Number(m.year);
    const viewMonth0 = new Date(Date.UTC(viewYear, ["January","February","March","April","May","June","July","August","September","October","November","December"].indexOf(m.month), 1)).getUTCMonth();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth0 + 1, 0)).getUTCDate();
    const firstDow = new Date(Date.UTC(viewYear, viewMonth0, 1)).getUTCDay();
    const todayKey = istDayKey(new Date());

    let html = "";
    for (let i = 0; i < firstDow; i++) html += `<div class="cal-cell blank" aria-hidden="true"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(viewYear, viewMonth0, day));
      const key = istDayKey(date);
      const dayEvents = events.filter((e) => e.key === key);
      const hasStart = dayEvents.some((e) => e.type === "start");
      const hasEnd = dayEvents.some((e) => e.type === "end");
      const cls = ["cal-cell"];
      if (hasStart) cls.push("event-start");
      else if (hasEnd) cls.push("event-end");
      else if (key === todayKey) cls.push("today");
      else if (date.getUTCDay() === 0) cls.push("sunday");
      if (selectedKey === key && key !== todayKey) cls.push("selected");
      html += `<div class="${cls.join(" ")}" data-key="${key}">
          <div class="day-number text-center">${day}</div>
          ${dayEvents.map((e) => `<div class="cal-event" title="${esc(e.title)}">${esc(e.title)}</div>`).join("")}
        </div>`;
    }
    const total = firstDow + daysInMonth;
    for (let i = 0; i < (7 - (total % 7)) % 7; i++) html += `<div class="cal-cell blank" aria-hidden="true"></div>`;
    $("#cal-days").innerHTML = html;
    $$("#cal-days .cal-cell[data-key]").forEach((cell) =>
      cell.addEventListener("click", () => { selectedKey = cell.dataset.key; paint(); })
    );
  }

  $("#cal-prev").addEventListener("click", () => { anchor = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1); paint(); });
  $("#cal-next").addEventListener("click", () => { anchor = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1); paint(); });
  paint();
}

/* ============================== courses ============================== */

async function renderCourses(v) {
  const d = await apiOrThrow("/student/courses");
  if (d.courses.length === 0) {
    v.innerHTML = `<div class="empty-state">
      <div class="empty-card"><div class="inner">
        ${icon("bookIcon", "ic xl")} <span style="color:hsl(38 92% 50%)">No Courses Enrolled !</span>
      </div></div></div>`;
    return;
  }

  v.innerHTML = `<div class="course-grid">${d.courses.map((c) => {
    if (!c.courseStatus) {
      return `<div class="course-card invalid">
        <div style="padding:1.25rem 2rem;">
          <div class="head">
            <div class="lang"><span class="fallback">${icon("terminal")}</span></div>
            <div class="ttl"><h2>${esc(c.courseName)}</h2></div>
          </div>
          ${courseDates(c)}
        </div></div>`;
    }
    return `<div class="course-card" data-cid="${esc(c.courseId)}" data-name="${esc(c.courseName)}">
      <div style="padding:1.25rem 2rem;">
        <div class="head">
          <div class="lang">${langIcon(c.courseLanguage)}</div>
          <div class="ttl"><h2>${esc(c.courseName)}</h2></div>
        </div>
        ${courseDates(c)}
        <div class="progress-row">
          <div class="progress"><div style="width:${c.courseProgres}%"></div></div>
          <div class="pct">${c.courseProgres}%</div>
        </div>
      </div></div>`;
  }).join("")}</div>`;

  $$(".course-card[data-cid]", v).forEach((el) =>
    el.addEventListener("click", () => {
      state.course = { id: el.dataset.cid, title: el.dataset.name };
      navigate("modules");
    })
  );
}

const courseDates = (c) => `
  <div class="dates">
    <div class="date-col">
      <div class="ic-wrap">${icon("calendarCheck")}</div>
      <div class="d">${esc(c.courseStartDate)}<span class="l">Start Date</span></div>
    </div>
    <div class="date-col end">
      <div class="ic-wrap">${icon("calendarX")}</div>
      <div class="d">${esc(c.courseEndDate)}<span class="l">End Date</span></div>
    </div>
  </div>`;

/* ============================== modules (course page) ============================== */

async function renderModules(v) {
  const d = await apiOrThrow(`/student/courses/${state.course.id}/modules`);
  const mods = d.modules;
  const selected0 = mods[0] || null;

  v.innerHTML = `
    <div class="module-wrap">
      <div class="module-flex">
        <div class="module-list" id="mod-list"></div>
        <div class="module-panel">
          <div class="mp-title" id="mp-title">${selected0 ? esc(selected0.title) : "No modules"}</div>
          <div class="mp-body" id="mp-body"></div>
        </div>
      </div>
    </div>`;

  let openAcc = "feedbacks";
  let selected = selected0;

  function paintList() {
    const fb = (d.feedbacks || []).map((f) => {
      const todayKey = istDayKey(new Date());
      const fKey = istDayKey(new Date(f.date));
      const status = fKey === todayKey ? "active" : new Date(f.date) < new Date() ? "expired" : "upcoming";
      const cls = status === "active" ? "badge-green" : status === "expired" ? "badge-red" : "badge-orange";
      const clickable = status === "active";
      return `<div class="mod-row ${clickable ? "" : ""}" data-fb="${esc(f.id)}" style="${clickable ? "" : "cursor:not-allowed"}">
          ${icon("star", "ic")} <span style="width:70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(f.title)}</span>
          <span class="badge ${cls}">${status}</span>
        </div>`;
    }).join("");

    $("#mod-list").innerHTML = `
      ${fb ? `<div class="acc-item ${openAcc === "feedbacks" ? "open" : ""}" id="acc-feedbacks">
          <button class="acc-trigger">Feedbacks ${icon("chevR", "ic acc-chevron")}</button>
          <div class="acc-content"><div class="flex flex-col gap-3 w-full" style="display:flex;flex-direction:column;gap:0.75rem;width:100%">${fb}</div></div>
        </div>` : ""}
      ${mods.map((m) => {
        const st = d.progress?.[m.id]?.modulestatus || "";
        const done = st === "submitted";
        const current = selected?.id === m.id;
        return `
        <div class="acc-item ${openAcc === `m-${m.id}` ? "open" : ""} ${done ? "done" : current ? "current" : ""}" data-acc="m-${m.id}">
          <button class="acc-trigger"><span style="display:flex;align-items:center;gap:0.5rem;min-width:0;">${esc(m.title)}${done ? `<span class="badge badge-green" style="font-size:11px;">✓ Completed</span>` : ""}</span> ${icon("chevR", "ic acc-chevron")}</button>
          <div class="acc-content">
            <button class="mod-row ${current ? "selected" : ""}" data-mod="${esc(m.id)}" data-name="${esc(m.title)}">
              ${done ? icon("check", "ic") : icon("code", "ic")} Code Space
            </button>
            ${m.concepturl ? `<button class="mod-row" data-concept="${esc(m.concepturl)}">${icon("brain", "ic")} Concept</button>` : ""}
          </div>
        </div>`;
      }).join("")}
    `;

    $$("#mod-list .acc-item").forEach((item) => {
      const trig = $(".acc-trigger", item);
      if (trig) trig.onclick = () => {
        const id = item.dataset.acc || "feedbacks";
        openAcc = openAcc === id ? null : id;
        paintList();
      };
    });
    $$("#mod-list [data-mod]").forEach((el) =>
      (el.onclick = () => {
        selected = mods.find((m) => m.id === el.dataset.mod);
        $("#mp-title").textContent = selected.title;
        paintList();
        paintPanel("test");
      })
    );
    $$("#mod-list [data-concept]").forEach((el) => (el.onclick = () => openConcept(el.dataset.concept)));
    $$("#mod-list [data-fb]").forEach((el) =>
      (el.onclick = () => {
        const fb = (d.feedbacks || []).find((f) => f.id === el.dataset.fb);
        if (!fb) return;
        const todayKey = istDayKey(new Date());
        if (istDayKey(new Date(fb.date)) !== todayKey) return;
        dialog(`
          <h2 class="dialog-title">${esc(fb.title)} — ${esc(fb.date?.slice(0, 10) || "")}</h2>
          <p class="dialog-desc" style="word-break:break-all;">${esc(fb.link)}</p>
          <div class="dialog-footer">
            <button class="btn btn-destructive" id="fb-cancel">Cancel</button>
            <button class="btn btn-primary" id="fb-open">Open</button>
          </div>`);
        $("#fb-cancel").onclick = closeDialog;
        $("#fb-open").onclick = () => { closeDialog(); app.openExternal(fb.link); };
      })
    );
  }

  let tab = "test";
  function paintPanel(which) {
    tab = which || tab;
    const m = selected;
    const body = $("#mp-body");
    if (!m) { body.innerHTML = `<div class="empty-state">No modules yet.</div>`; return; }

    const progress = d.progress[m.id];
    const status = progress?.modulestatus || "";
    const isUnlocked = m.moduledate ? new Date(m.moduledate) <= new Date() : false;

    const tabsHtml = `
      <div class="tabs">
        <div class="tabs-list">
          <button class="tabs-trigger ${tab === "test" ? "active" : ""}" data-tab="test">Practice</button>
          ${(m.modulereference?.length > 0) ? `<button class="tabs-trigger ${tab === "references" ? "active" : ""}" data-tab="references">References</button>` : ""}
          <button class="tabs-trigger ${tab === "result" ? "active" : ""}" data-tab="result">Result</button>
        </div>
        <div class="tabs-content" id="tab-body"></div>
      </div>`;
    body.innerHTML = tabsHtml;
    $$(".tabs-trigger", body).forEach((b) => (b.onclick = () => paintPanel(b.dataset.tab)));
    const tb = $("#tab-body", body);

    if (tab === "test") {
      if (!isUnlocked) {
        tb.innerHTML = `<div class="center-wrap"><div class="card card-pad" style="width:28rem;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
              <div style="background:hsl(38 92% 50%);color:white;border-radius:9999px;padding:0.25rem;">${icon("lock", "ic lg")}</div>
              <p style="font-weight:500;">Practice Locked !</p>
              <p style="font-weight:500;">( Unlocks on <span style="color:hsl(142 71% 35%); font-weight:700;">${esc(fmtDate(m.moduledate))}</span> )</p>
            </div></div></div>`;
        return;
      }
      if (status === "submitted") {
        tb.innerHTML = `<div class="center-wrap"><div class="card card-pad" style="width:22rem;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
              <div style="background:hsl(142 71% 40%);color:white;border-radius:9999px;padding:0.25rem;">${icon("checkCircle", "ic lg")}</div>
              <p style="font-weight:500;">Module Completed !</p>
            </div></div></div>`;
        return;
      }
      const btn = status === "started" || status === "retake"
        ? `<button class="btn btn-orange btn-block" id="start-mod">${icon("chevronsR", "ic")} ${status === "retake" ? "Retake Module" : "Resume Module"}</button>`
        : `<button class="btn btn-green btn-block" id="start-mod">${icon("chevronsR", "ic")} Start Module</button>`;
      tb.innerHTML = `<div class="center-wrap"><div class="card" style="width:22rem;">
          <div class="card-pad" style="display:flex;flex-direction:column;gap:1rem;">
            <div><h3 style="font-weight:600;">${esc(m.title)}</h3><p class="muted small">${esc(fmtDate(m.moduledate))}</p></div>
            <div class="row" style="gap:0.5rem;"><span style="height:0.5rem;width:0.5rem;border-radius:9999px;background:hsl(199 89% 48%);"></span>
              <p style="font-size:0.875rem;font-weight:500;width:100%;"><span style="width:50%;display:inline-block;">MCQ Questions</span><span>:&nbsp;&nbsp;&nbsp;${m.mcqcount}</span></p></div>
            <div class="row" style="gap:0.5rem;"><span style="height:0.5rem;width:0.5rem;border-radius:9999px;background:hsl(199 89% 48%);"></span>
              <p style="font-size:0.875rem;font-weight:500;width:100%;"><span style="width:50%;display:inline-block;">Code Questions</span><span>:&nbsp;&nbsp;&nbsp;${m.questionscount}</span></p></div>
            ${btn}
          </div></div></div>`;
      $("#start-mod", tb).onclick = () => {
        dialog(`
          <h2 class="dialog-title">Starting Module</h2>
          <p class="dialog-desc">Do not close the practice window or switch away during the test, else the test may be submitted with mistakes.</p>
          <div class="dialog-footer">
            <button class="btn btn-destructive" id="sm-cancel">Cancel</button>
            <button class="btn btn-primary" id="sm-go">Start</button>
          </div>`);
        $("#sm-cancel").onclick = closeDialog;
        $("#sm-go").onclick = async () => {
          $("#sm-go").disabled = true;
          try {
            await apiOrThrow("/student/practice/module", { method: "POST", body: { moduleId: m.id, action: "start" } });
            closeDialog();
            state.moduleCtx = { cid: state.course.id, mid: m.id, courseName: state.course.title, moduleName: m.title };
            navigate("practice");
          } catch (e) { toast(e.message, "error"); $("#sm-go").disabled = false; }
        };
      };
    }

    if (tab === "result") {
      if (status !== "submitted") {
        tb.innerHTML = `<div class="center-wrap"><div class="card card-pad" style="width:28rem;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
              <div style="background:hsl(38 92% 50%);color:white;border-radius:9999px;padding:0.25rem;">${icon("lock", "ic lg")}</div>
              <p style="font-weight:500;">Result Analysis Locked !</p>
            </div></div></div>`;
        return;
      }
      tb.innerHTML = `<div class="center-wrap"><div class="card" style="width:28rem;">
          <div class="card-pad" style="display:flex;flex-direction:column;gap:1rem;">
            <div class="row" style="justify-content:center;">
              <div style="background:hsl(142 71% 40%);color:white;border-radius:9999px;padding:0.25rem;">${icon("checkCircle", "ic lg")}</div> Result Analysis
            </div>
            <table class="tbl">
              <thead><tr><th>Module</th><th>Your Score</th><th>Max Score</th><th class="right">Time Taken</th></tr></thead>
              <tbody>
                <tr><td class="font-medium"><b>MCQ</b></td><td>${progress?.usermcqscore ?? 0}</td><td>${progress?.totalmcqscore ?? 0}</td><td class="right">${progress?.mcqtime ?? 0}s</td></tr>
                <tr><td class="font-medium"><b>Code</b></td><td>${progress?.userquestionscore ?? 0}</td><td>${progress?.totalquestionscore ?? 0}</td><td class="right">${progress?.questiontime ?? 0}s</td></tr>
              </tbody>
            </table>
          </div></div></div>`;
    }

    if (tab === "references") {
      tb.innerHTML = `<div class="ref-grid">${(m.modulereference || []).map((r) => `
        <div class="ref-card" data-ref="${esc(r.link)}">
          <div class="r-body">${icon(r.type === "yt" ? "fileVideo" : "fileText", "ic xl")}</div>
          <div class="r-foot">${esc(r.title)}</div>
        </div>`).join("") || `<div class="empty-state">No references.</div>`}</div>`;
      $$(".ref-card", tb).forEach((el) => (el.onclick = () => app.openExternal(el.dataset.ref)));
    }
  }

  function fmtDate(iso) {
    try {
      const dt = new Date(iso);
      return `${String(dt.getUTCDate()).padStart(2, "0")}/${String(dt.getUTCMonth() + 1).padStart(2, "0")}/${dt.getUTCFullYear()}`;
    } catch { return "—"; }
  }

  paintList();
  paintPanel("test");
}

function openConcept(url) {
  let enlarged = false;
  dialog(`
    <h2 class="dialog-title">Concept Preview</h2>
    <div style="position:relative; width:100%; height:${window.innerHeight * 0.6}px; border-radius:var(--radius); overflow:hidden; border:1px solid var(--border); background:white;">
      <iframe src="${esc(url)}" style="width:100%; height:100%; border:0;" title="Embedded Content"></iframe>
    </div>
    <div class="dialog-footer">
      <button class="btn" id="cp-enlarge">${icon("maximize", "ic")} Enlarge</button>
      <button class="btn btn-primary" id="cp-open">Open externally</button>
    </div>`);
  $("#cp-enlarge").onclick = () => { enlarged = !enlarged; app.openExternal(url); };
  $("#cp-open").onclick = () => { closeDialog(); app.openExternal(url); };
}

/* ============================== lab ============================== */

function renderLab(v) {
  v.innerHTML = `<div class="empty-state">
    <div class="empty-card"><div class="inner">
      <span style="color:hsl(38 92% 50%)">${icon("laptop", "ic xl")}</span> No Labs Enrolled !
    </div></div></div>`;
}

/* ============================== practice home ============================== */

function closePractice() {
  const pr = $("#practice-root");
  if (!pr.classList.contains("hidden")) {
    pr.classList.add("hidden");
    pr.innerHTML = "";
  }
  if (state.assessment?.timer) { clearInterval(state.assessment.timer); state.assessment = null; }
}

async function renderPracticeHome(v) {
  const ctx = state.moduleCtx;
  if (!ctx) { navigate("courses"); return; }

  const d = await apiOrThrow(`/student/modules/${ctx.mid}`);
  const p = d.progress;

  v.innerHTML = `
    <div style="width:100%; height:calc(100vh - 7rem); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem;">
      <div class="card row" style="width:33%; min-width:22rem; height:3rem; justify-content:center; font-weight:700; font-size:1.05rem; box-shadow:0 10px 25px -8px rgba(0,0,0,0.18);">
        ${esc(ctx.courseName)} ${icon("chevR", "ic")} ${esc(ctx.moduleName)}
      </div>
      <div style="display:flex; gap:1.25rem; width:50%; justify-content:center;">
        ${(p?.totalmcqscore ?? d.mcqs.length) !== 0 ? `
        <div style="width:15rem; display:flex; flex-direction:column;">
          <div style="border:2px solid var(--border); border-radius:var(--radius);">
            <div style="padding:0.75rem; text-align:center;"><h2>MCQ's</h2><h4 style="font-size:1.5rem;font-weight:700;">${p?.totalmcqscore ?? d.mcqs.length}</h4></div>
            <div style="border-top:2px solid var(--border); padding:0.75rem; text-align:center;"><h2>Marks</h2><h4 style="font-size:1.5rem;font-weight:700;">${p?.totalmcqscore ?? d.mcqs.length}</h4></div>
          </div>
          ${p?.mcqstatus === "submitted"
            ? `<div style="height:2.25rem; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--primary) 50%, transparent); color:white; border-radius:var(--radius);">${icon("puzzle", "ic")} MCQ Submitted</div>`
            : `<button class="btn btn-green btn-block mt1" id="go-mcq">${icon("puzzle", "ic")} Start MCQ</button>`}
        </div>` : ""}
        <div style="width:15rem; display:flex; flex-direction:column;">
          <div style="border:2px solid var(--border); border-radius:var(--radius);">
            <div style="padding:0.75rem; text-align:center;"><h2>Programs</h2><h4 style="font-size:1.5rem;font-weight:700;">${Math.round((p?.totalquestionscore ?? 0) / 10) || d.codeQuestions.length}</h4></div>
            <div style="border-top:2px solid var(--border); padding:0.75rem; text-align:center;"><h2>Marks</h2><h4 style="font-size:1.5rem;font-weight:700;">${p?.totalquestionscore ?? d.codeQuestions.length * 10}</h4></div>
          </div>
          ${p?.questionstatus === "submitted"
            ? `<div style="height:2.25rem; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--primary) 50%, transparent); color:white; border-radius:var(--radius);">${icon("code", "ic")} Code Submitted</div>`
            : `<button class="btn btn-green btn-block mt1" id="go-code" ${d.codeQuestions.length === 0 ? "disabled" : ""}>${icon("code", "ic")} Start Code</button>`}
        </div>
      </div>
      <div class="row" style="justify-content:center;">
        <button class="btn btn-primary" id="ph-back">${icon("chevL", "ic")} Back</button>
        ${p?.mcqstatus === "submitted" && p?.questionstatus === "submitted" ? `<button class="btn btn-green" id="ph-submit">Submit Module</button>` : ""}
      </div>
    </div>`;

  $("#ph-back").onclick = () => navigate("modules");
  const goMcq = $("#go-mcq");
  if (goMcq) goMcq.onclick = () => openMcqPractice(d);
  const goCode = $("#go-code");
  if (goCode) goCode.onclick = () => openCodePractice(d);
  const phSubmit = $("#ph-submit");
  if (phSubmit) phSubmit.onclick = () => {
    dialog(`
      <h2 class="dialog-title">Submit Module</h2>
      <p class="dialog-desc">Submitting the module will finalize your scores. Continue?</p>
      <div class="dialog-footer">
        <button class="btn btn-destructive" id="pm-no">Cancel</button>
        <button class="btn btn-primary" id="pm-yes">Submit</button>
      </div>`);
    $("#pm-no").onclick = closeDialog;
    $("#pm-yes").onclick = async () => {
      try {
        await apiOrThrow("/student/practice/module", { method: "POST", body: { moduleId: ctx.mid, action: "submit" } });
        closeDialog();
        toast("Module Submitted !");
        navigate("modules");
      } catch (e) { toast(e.message, "error"); }
    };
  };
}

/* ============================== MCQ practice (full-screen) ============================== */

function openMcqPractice(d) {
  const mcqs = d.mcqs;
  if (mcqs.length === 0) return;
  const pr = $("#practice-root");
  pr.classList.remove("hidden");
  let idx = 0;
  const answers = {};   // mcqId -> selected 1..4
  const startAt = Date.now();

  pr.innerHTML = `
    <aside class="practice-rail">
      <div class="rail-nav">${mcqs.map((_, i) => `<button class="rail-btn" data-i="${i}">${i + 1}</button>`).join("")}</div>
      <div class="rail-foot">
        <button class="side-link" id="mcq-theme">${icon("moon", "ic")}</button>
        <button class="rail-btn active" id="mcq-submit-btn" title="Submit">${icon("check", "ic")}</button>
        <button class="rail-btn" id="mcq-exit" title="Exit">${icon("x", "ic")}</button>
      </div>
    </aside>
    <div class="practice-main">
      <div class="practice-panels">
        <div class="ppanel">
          <div class="p-head">Question : <span id="q-num">1</span>&nbsp;/&nbsp;${mcqs.length}</div>
          <div class="p-body" id="q-body"></div>
          <div class="p-foot left">Marks : 1</div>
        </div>
        <div class="ppanel">
          <div class="p-head">Answer here</div>
          <div class="p-body" id="a-body"></div>
          <div class="p-foot"><button class="btn btn-green" id="q-next">Next ${icon("arrowR", "ic")}</button></div>
        </div>
      </div>
    </div>`;

  const paint = () => {
    const q = mcqs[idx];
    $("#q-num").textContent = idx + 1;
    $("#q-body").innerHTML = `
      <div class="q-title">${esc(q.title)}</div>
      <div class="q-desc">${esc(q.description)}</div>
      ${q.referenceimg ? `<img src="${esc(q.referenceimg)}" alt="${esc(q.title)}" style="max-height:300px; object-fit:fill; border-radius:var(--radius); border:1px solid var(--border);" />` : ""}
      ${q.iscodesnippet && q.codesnippet ? `<pre class="codesnippet">${esc(q.codesnippet)}</pre>` : ""}
    `;
    $("#a-body").innerHTML = q.options.map((o, i) => `
      <div class="opt-row ${answers[q.id] === i + 1 ? "selected" : ""}" data-opt="${i + 1}">
        <span class="radio-dot"></span><span>${esc(o)}</span>
      </div>`).join("");
    $$("#a-body .opt-row").forEach((el) =>
      el.addEventListener("click", () => {
        answers[q.id] = Number(el.dataset.opt);
        $$("#a-body .opt-row").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");
        $(`#mcq-practice .rail-btn[data-i='${idx}']`)?.classList.add("answered");
      })
    );
    $$(".rail-btn[data-i]", pr).forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.i) === idx);
      b.classList.toggle("answered", Boolean(answers[mcqs[Number(b.dataset.i)].id]));
    });
    $("#q-next").disabled = idx >= mcqs.length - 1;
  };

  $$(".rail-btn[data-i]", pr).forEach((b) => (b.onclick = () => { idx = Number(b.dataset.i); paint(); }));
  $("#q-next").onclick = () => { if (idx < mcqs.length - 1) { idx += 1; paint(); } };
  window.__dbg = { mcqs, answers, get idx() { return idx; }, d };
  $("#mcq-theme").onclick = () => { applyTheme(document.body.classList.contains("dark") ? "light" : "dark"); $("#mcq-theme").innerHTML = icon(document.body.classList.contains("dark") ? "sun" : "moon", "ic"); };
  $("#mcq-exit").onclick = () => { closePractice(); navigate("practice"); };
  $("#mcq-submit-btn").onclick = () => {
    const answered = Object.keys(answers).length;
    if (answered < mcqs.length) {
      dialog(`
        <h2 class="dialog-title">Submit MCQs</h2>
        <p class="dialog-desc">You answered ${answered}/${mcqs.length}. Submit anyway?</p>
        <div class="dialog-footer">
          <button class="btn btn-destructive" id="mc-partial-no">Close</button>
          <button class="btn btn-primary" id="mc-partial-yes">Submit anyway</button>
        </div>`);
      $("#mc-partial-no").onclick = closeDialog;
      $("#mc-partial-yes").onclick = () => { closeDialog(); showMcqSubmitDialog(); };
      return;
    }
    showMcqSubmitDialog();
  };

  function showMcqSubmitDialog() {
    dialog(`
      <h2 class="dialog-title">Submit MCQs</h2>
      <p class="dialog-desc">Are you sure want to submit MCQs ?</p>
      <div class="dialog-footer">
        <button class="btn btn-destructive" id="mc-no">Close</button>
        <button class="btn btn-primary" id="mc-yes">Submit</button>
      </div>`);
    $("#mc-no").onclick = closeDialog;
    $("#mc-yes").onclick = async () => {
      const btn = $("#mc-yes");
      btn.disabled = true;
      btn.innerHTML = `${icon("loader", "ic spin")} Submit`;
      try {
        const r = await apiOrThrow("/student/practice/mcq", {
          method: "POST",
          body: {
            moduleId: state.moduleCtx.mid,
            answers: Object.entries(answers).map(([mcqId, selected]) => ({ mcqId, selected })),
            duration: Math.floor((Date.now() - startAt) / 1000),
            tabswitches: 0,
          },
        });
        closeDialog();
        closePractice();
        toast(`MCQ's Submitted — scored ${r.score}/${r.total} (${r.errors} wrong)`);
        navigate("practice");
      } catch (e) {
        closeDialog();
        toast(e.message, "error");
        if (String(e.message).includes("already")) { closePractice(); navigate("practice"); }
      }
    };
  }

  paint();
}

/* ============================== code practice (full-screen) ============================== */

function openCodePractice(d) {
  const qs = d.codeQuestions;
  if (qs.length === 0) return;
  const pr = $("#practice-root");
  pr.classList.remove("hidden");
  let idx = 0;
  const perQ = {};  // qid -> {code, samplePassed, tests:[], compiles, errors}
  const startAt = Date.now();

  const saved = () => {
    const q = qs[idx];
    if (!perQ[q.id]) perQ[q.id] = { code: q.lastcode || `// code here ! \n\n`, samplePassed: false, tests: null, compiles: 0, errors: 0 };
    return perQ[q.id];
  };

  pr.innerHTML = `
    <aside class="practice-rail">
      <div class="rail-nav">${qs.map((_, i) => `<button class="rail-btn" data-i="${i}">${i + 1}</button>`).join("")}</div>
      <div class="rail-foot">
        <button class="rail-btn" id="cp-ai" title="ATOM AI">${icon("sparkles", "ic")}</button>
        <button class="rail-btn active" id="cp-submit" title="Submit">${icon("check", "ic")}</button>
        <button class="rail-btn" id="cp-exit" title="Exit">${icon("x", "ic")}</button>
      </div>
    </aside>
    <div class="practice-main">
      <div class="practice-panels" style="height:80%;">
        <div class="ppanel">
          <div class="p-head">Question : <span id="c-num">1</span>&nbsp;/&nbsp;${qs.length}</div>
          <div class="p-body" id="cq-body"></div>
          <div class="p-foot left">Max Score : <span id="cq-marks"></span></div>
        </div>
        <div class="ppanel">
          <div class="p-head">Write your code</div>
          <div style="height:72%; width:100%; padding:0.75rem 1rem;" id="ed-wrap"></div>
          <div class="p-foot" style="gap:0.5rem;">
            <button class="btn btn-outline btn-sm" id="run-sample">${icon("play", "ic sm")} Run Sample</button>
            <button class="btn btn-outline btn-sm" id="run-tests">${icon("clock", "ic sm")} Run Testcases</button>
            <span class="spacer"></span>
            <button class="btn btn-green btn-sm" id="cp-submit2">Submit</button>
          </div>
        </div>
      </div>
    </div>`;

  const paint = () => {
    const q = qs[idx];
    const s = saved();
    $("#c-num").textContent = idx + 1;
    $("#cq-marks").textContent = q.maxscore ?? 10;
    $("#cq-body").innerHTML = `
      <div class="q-title">${esc(q.title)}</div>
      <div class="q-desc">${esc(q.description)}</div>
      ${q.inputconstrains ? `<div class="q-desc"><b>Constraints:</b> ${esc(q.inputconstrains)}</div>` : ""}
      ${q.sampleinput1 ? `<div style="width:100%"><b class="small">Sample Input 1</b><pre class="codesnippet">${esc(q.sampleinput1)}</pre><b class="small">Sample Output 1</b><pre class="codesnippet">${esc(q.sampleoutput1)}</pre></div>` : ""}
      ${q.sampleinput2 ? `<div style="width:100%"><b class="small">Sample Input 2</b><pre class="codesnippet">${esc(q.sampleinput2)}</pre><b class="small">Sample Output 2</b><pre class="codesnippet">${esc(q.sampleoutput2)}</pre></div>` : ""}
      ${q.referenceimg ? `<img src="${esc(q.referenceimg)}" alt="${esc(q.title)}" style="max-height:220px; border-radius:var(--radius); border:1px solid var(--border);" />` : ""}
    `;
    $("#ed-wrap").innerHTML = `
      <div class="editor-wrap ${document.body.classList.contains("dark") ? "" : "light"}" style="height:100%;">
        <div class="editor-head">${langIcon(q.lang)} <b>${esc((q.lang || "").toUpperCase())}</b> · ${esc(q.difficulty || "")} ${q.submissionstatus ? '<span class="badge badge-green" style="margin-left:auto;">submitted</span>' : ""}</div>
        <textarea class="editor-area" id="code-editor" spellcheck="false">${esc(s.code)}</textarea>
      </div>`;
    const ed = $("#code-editor");
    ed.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const st = ed.selectionStart;
        ed.value = ed.value.slice(0, st) + "    " + ed.value.slice(ed.selectionEnd);
        ed.selectionStart = ed.selectionEnd = st + 4;
      }
    });
    ed.addEventListener("input", () => (s.code = ed.value));
    $$(".rail-btn[data-i]", pr).forEach((b) => b.classList.toggle("active", Number(b.dataset.i) === idx));
  };

  const getCode = () => $("#code-editor").value;

  const guardKeywords = (q, code) => {
    const blacklist = (q.blacklist || "").split(",").map((s) => s.trim()).filter(Boolean);
    const whitelist = (q.whitelist || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (blacklist.some((k) => code.includes(k))) { toast("Blacklist keyword(s) found in the code!", "error"); return false; }
    if (whitelist.some((k) => !code.includes(k))) { toast("Whitelist keyword(s) missing in the code!", "error"); return false; }
    return true;
  };

  $$(".rail-btn[data-i]", pr).forEach((b) => (b.onclick = () => { idx = Number(b.dataset.i); paint(); }));
  $("#cp-exit").onclick = () => { closePractice(); navigate("practice"); };
  $("#cp-theme") && ($("#cp-theme").onclick = () => {});

  $("#run-sample").onclick = async () => {
    const q = qs[idx]; const s = saved();
    if (!guardKeywords(q, getCode())) return;
    dialog(`
      <h2 class="dialog-title">Running sample…</h2>
      <p class="dialog-desc">${icon("loader", "ic spin")} Executing against sample testcase</p>`);
    try {
      const r = await runQuestionCode({ q, code: getCode(), mode: "sample", moduleId: state.moduleCtx.mid });
      s.compiles += 1;
      if (r.passed) {
        s.samplePassed = true;
        dialog(`
          <h2 class="dialog-title">Sample Testcase ${icon("check", "ic")}</h2>
          <p class="dialog-desc" style="color:hsl(142 71% 35%); font-weight:600;">Passed</p>
          <pre class="out-pre">${esc(r.output ?? "")}</pre>
          <div class="dialog-footer single"><button class="btn btn-primary" onclick="document.querySelector('#modal-backdrop').classList.add('hidden')">Close</button></div>`);
      } else {
        s.errors += 1;
        dialog(`
          <h2 class="dialog-title">Sample Testcase</h2>
          <p class="dialog-desc" style="color:var(--destructive); font-weight:600;">${esc(r.compileMessage || "Failed")}</p>
          <pre class="out-pre">${esc(r.output ?? "")}</pre>
          <div class="dialog-footer single"><button class="btn btn-primary" onclick="document.querySelector('#modal-backdrop').classList.add('hidden')">Close</button></div>`);
      }
    } catch (e) { closeDialog(); toast(e.message, "error"); }
  };

  $("#run-tests").onclick = async () => {
    const q = qs[idx]; const s = saved();
    if (!guardKeywords(q, getCode())) return;
    dialog(`
      <h2 class="dialog-title">Running testcases…</h2>
      <p class="dialog-desc">${icon("loader", "ic spin")} Executing hidden test cases</p>`);
    try {
      const r = await runQuestionCode({ q, code: getCode(), mode: "tests", moduleId: state.moduleCtx.mid });
      s.compiles += 1;
      s.tests = [r.testcase1status, r.testcase2status, r.testcase3status];
      if (s.tests.includes("error")) s.errors += 1;
      const row = (n, st) => `<div class="testcase-row"><b>Test case ${n}</b><span class="spacer"></span>
        <span class="badge ${st === "pass" ? "badge-green" : st === "error" ? "badge-red" : "badge-orange"}">${st || "—"}</span></div>`;
      dialog(`
        <h2 class="dialog-title">Test cases</h2>
        ${row(1, r.testcase1status)}${row(2, r.testcase2status)}${row(3, r.testcase3status)}
        <p class="dialog-desc">${r.passedCount}/3 passed · earns ${1 + r.passedCount * 3} / 10 marks (incl. sample bonus)</p>
        <div class="dialog-footer single"><button class="btn btn-primary" onclick="document.querySelector('#modal-backdrop').classList.add('hidden')">Close</button></div>`);
    } catch (e) { closeDialog(); toast(e.message, "error"); }
  };

  const submitQ = () => {
    const q = qs[idx]; const s = saved();
    if (q.submissionstatus) { toast("Already submitted !", "warning"); return; }
    dialog(`
      <h2 class="dialog-title">Submit Solution</h2>
      <p class="dialog-desc">Are you sure want to submit this solution ?</p>
      <div class="dialog-footer">
        <button class="btn btn-destructive" id="cq-no">Close</button>
        <button class="btn btn-primary" id="cq-yes">Submit</button>
      </div>`);
    $("#cq-no").onclick = closeDialog;
    $("#cq-yes").onclick = async () => {
      $("#cq-yes").disabled = true;
      const tests = s.tests || [null, null, null];
      const passedTests = tests.filter((t) => t === "pass").length;
      try {
        const r = await apiOrThrow("/student/practice/code", {
          method: "POST",
          body: {
            questionId: q.id, moduleId: state.moduleCtx.mid,
            usercode: getCode(),
            score: (s.samplePassed ? 1 : 0) + passedTests * 3,
            compiles: s.compiles || 1, errors: s.errors || 0,
            testcase1status: tests[0], testcase2status: tests[1], testcase3status: tests[2],
            duration: Math.floor((Date.now() - startAt) / 1000), tabswitches: 0,
          },
        });
        closeDialog();
        toast(r.message || "Code Submitted !");
        q.submissionstatus = true;
        if (qs.every((x) => x.submissionstatus)) {
          closePractice();
          toast("All programs submitted — you can submit the module now.");
          navigate("practice");
        } else {
          const next = qs.findIndex((x) => !x.submissionstatus);
          if (next >= 0) idx = next;
          paint();
        }
      } catch (e) { closeDialog(); toast(e.message, "error"); }
    };
  };
  $("#cp-submit").onclick = submitQ;
  $("#cp-submit2").onclick = submitQ;

  $("#cp-ai").onclick = () => {
    const q = qs[idx]; const s = saved();
    openSheet(`
      <div class="sheet-head">${icon("sparkles", "ic")} ATOM AI <span class="spacer"></span>
        <button class="btn btn-ghost btn-sm" id="ai-close">${icon("x", "ic sm")}</button></div>
      <div class="sheet-body" id="ai-log">
        <div class="ai-msg">Hi ${esc(state.user?.name || "there")}! I analyze your code for <b>${esc(q.title)}</b> and guide you — I never write the full solution. Ask for a hint or press "Analyze my code".</div>
      </div>
      <div class="sheet-foot">
        <input class="inp" id="ai-input" placeholder="Ask for a hint…" style="flex:1;" />
        <button class="btn btn-primary" id="ai-analyze">Analyze code</button>
        <button class="btn btn-icon btn-primary" id="ai-send">${icon("send", "ic sm")}</button>
      </div>`);
    $("#ai-close").onclick = closeSheet;

    const ask = async (useCode) => {
      const log = $("#ai-log");
      const prompt = useCode ? "Analyze my current code and suggest improvements." : ($("#ai-input").value.trim() || "Give me a hint to approach this problem.");
      log.insertAdjacentHTML("beforeend", `<div class="ai-msg user">${esc(prompt)}</div>`);
      $("#ai-input").value = "";
      log.insertAdjacentHTML("beforeend", `<div class="ai-msg" id="ai-wait">${icon("loader", "ic spin")} Thinking…</div>`);
      log.scrollTop = log.scrollHeight;
      try {
        const r = await apiOrThrow("/student/ai", {
          method: "POST",
          body: { questionId: q.id, moduleId: state.moduleCtx.mid, code: useCode ? s.code : null },
        });
        $("#ai-wait")?.remove();
        log.insertAdjacentHTML("beforeend", `<div class="ai-msg">${esc(r.reply)}</div>`);
      } catch (e) {
        $("#ai-wait")?.remove();
        log.insertAdjacentHTML("beforeend", `<div class="ai-msg" style="color:var(--destructive)">${esc(e.message)}</div>`);
      }
      log.scrollTop = log.scrollHeight;
    };
    $("#ai-send").onclick = () => ask(false);
    $("#ai-analyze").onclick = () => ask(true);
    $("#ai-input").addEventListener("keydown", (e) => e.key === "Enter" && ask(false));
  };

  paint();
}

/* ============================== assessments list ============================== */

async function renderAssessments(v) {
  const d = await apiOrThrow("/student/assessments");
  if (d.assessments.length === 0) {
    v.innerHTML = `<div class="empty-state"><div class="empty-card"><div class="inner">
      ${icon("flask", "ic xl")} No Assessments Scheduled !</div></div></div>`;
    return;
  }

  const metaCol = (ic, val, label) => `
    <div class="meta-col">${icon(ic)}<div class="d">${esc(val)}</div><div class="l">${label}</div></div>`;

  v.innerHTML = `<div class="asm-grid">${d.assessments.map((a) => {
    const clickable = ["start", "resume", "retake"].includes(a.status);
    const bcls = { start: "b-green", resume: "b-green", retake: "b-orange", expired: "b-red" }[a.status] || "b-purple";
    const band = { expired: "badge-red", retake: "badge-orange", start: "badge-green", resume: "badge-green" }[a.status] || "badge-purple";
    const label = { start: "Start", resume: "Continue", retake: "Retake", expired: "Expired" }[a.status] || "Upcoming";
    return `<div class="asm-card ${bcls} ${clickable ? "clickable" : ""}" data-aid="${esc(a.assessmentid)}" data-title="${esc(a.title)}">
      <div style="padding:1.25rem 2rem;">
        <div class="head">
          <div class="flask">${icon("flask", "ic xl")}</div>
          <div class="ht"><h2>${esc(a.title)}</h2><p>${esc(a.coursetitle)}</p></div>
        </div>
        <div class="meta-row">${metaCol("calendarCheck", a.assessmentdate, "Date")}${metaCol("alarm", a.starttime, "Time")}${metaCol("clock", a.maxtime, "Duration")}</div>
        <div class="meta-row">${metaCol("code", a.codecount, "Code")}${metaCol("puzzle", a.mcqcount, "MCQ")}${metaCol("shieldAlert", a.tabswitches, "Tab Switches")}</div>
        <div class="status-band"><span class="${band}">${label}</span></div>
      </div></div>`;
  }).join("")}</div>`;

  $$(".asm-card.clickable", v).forEach((el) =>
    el.addEventListener("click", () => openAsmPrepare(el.dataset.aid, el.dataset.title))
  );
}

/* ============================== assessment prepare ============================== */

async function openAsmPrepare(aid, title) {
  const list = await apiOrThrow("/student/assessments");
  const meta = list.assessments.find((a) => a.assessmentid === aid);
  if (!meta) return;

  $("#view").innerHTML = `
    <div style="width:100%; min-height:calc(100vh - 7rem); display:flex; flex-direction:column; gap:1rem; justify-content:center; align-items:center;">
      <button class="btn btn-outline btn-sm" id="ap-back" style="align-self:flex-start;">${icon("chevL", "ic sm")} Back</button>
      <div class="card shadow-lg-card" style="width:30rem;">
        <div style="padding:1.25rem 2rem; display:flex; flex-direction:column; gap:1.25rem; align-items:center;">
          <h2 style="width:100%; text-align:center; font-size:1.05rem; font-weight:700; color:var(--primary);">${esc(meta.title)}</h2>
          <p style="align-self:flex-start; font-weight:600;">Important Instructions:</p>
          <ul class="instructions-list">
            <li>• The test will run for <strong>${esc(meta.maxtime)}</strong> (hh:mm)</li>
            <li>• You are allowed a maximum of <strong>${meta.tabswitches} tab switches</strong></li>
            <li>• Leaving the window will count as a tab switch</li>
            <li>• Exceeding the tab switch limit will end your test</li>
            <li>• Your progress will be saved automatically</li>
          </ul>
        </div>
      </div>
      <div class="card shadow-lg-card" style="width:30rem;">
        <div style="padding:1.25rem 2rem; display:flex; flex-direction:column; gap:1rem; align-items:center;">
          <h3>${meta.status === "retake" ? "Retake Access Key" : "Access Key"}</h3>
          <div class="otp-row" id="otp-row">${Array.from({ length: 6 }, (_, i) => `<input class="otp-slot" id="otp-${i}" maxlength="1" inputmode="numeric" ${meta.status === "resume" ? "disabled" : ""} />`).join("")}</div>
          <p class="muted small">${meta.status === "resume" ? "Resuming — no key needed, just continue." : "Enter the 6-digit key provided by your staff"}</p>
          ${meta.status === "resume"
            ? `<button class="btn btn-green" id="ap-go" style="width:66%;">Continue Test ${icon("chevR", "ic")}</button>`
            : `<button class="btn btn-primary" id="ap-go" style="width:66%;">Start Test ${icon("chevR", "ic")}</button>`}
        </div>
      </div>
    </div>`;

  $("#ap-back").onclick = () => navigate("assessments");

  // OTP slots behaviour
  const slots = $$(".otp-slot");
  slots.forEach((slot, i) => {
    slot.addEventListener("input", () => {
      slot.value = slot.value.replace(/\D/g, "").slice(0, 1);
      if (slot.value && i < slots.length - 1) slots[i + 1].focus();
    });
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !slot.value && i > 0) slots[i - 1].focus();
    });
    slot.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      text.split("").forEach((ch, j) => { if (slots[j]) slots[j].value = ch; });
      if (text.length) slots[Math.min(text.length, 5)].focus();
    });
  });

  $("#ap-go").onclick = async () => {
    const accesskey = meta.status === "resume" ? "" : slots.map((s) => s.value).join("");
    if (meta.status !== "resume" && accesskey.length < 6) { toast("Enter the full 6-digit access key", "warning"); return; }
    const btn = $("#ap-go");
    btn.disabled = true;
    try {
      const r = await apiOrThrow(`/student/assessments/${aid}/start`, {
        method: "POST",
        body: meta.status === "resume" ? {} : { accesskey },
      });
      toast("Permissions granted. Starting test...");
      openAsmAttempt(aid, r.uaid, r.remainingtime);
    } catch (e) {
      toast(e.message, "error");
      btn.disabled = false;
    }
  };
}

/* ============================== assessment attempt ============================== */

function openAsmAttempt(aid, uaid, remainingtime) {
  closeDialog();
  state.assessment = { aid, uaid, detail: null, timer: null, remaining: remainingtime ?? 0, tabCount: 0 };
  loadAttempt();
}

async function loadAttempt() {
  const A = state.assessment;
  try {
    const detail = await apiOrThrow(`/student/assessments/${A.aid}?uaid=${encodeURIComponent(A.uaid)}`);
    A.detail = detail;
  } catch (e) {
    toast(e.message, "error");
    navigate("assessments");
    return;
  }

  const pr = $("#practice-root");
  pr.classList.remove("hidden");
  const d = A.detail;
  A.answers = A.answers || {};   // mcqId -> selected (1..4)
  A.codeRuns = A.codeRuns || {}; // qid -> {statuses, passed, code, saved}

  paintAttemptShell();

  function paintAttemptShell() {
    pr.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden;">
        <div class="asm-topbar">
          <span class="t">${esc(d.assessment.title)}</span>
          <span class="muted small">max ${esc(d.attemptState.maxtabswitches)} tab switches</span>
          <span class="spacer"></span>
          <span class="tab-count" title="Tab switches used">${icon("shieldAlert", "ic sm")} <span id="tab-count">${A.tabCount}</span>/${esc(d.attemptState.maxtabswitches)}</span>
          <span class="timer-chip" id="asm-timer">${icon("clock", "ic sm")} --:--</span>
          <button class="btn btn-destructive btn-sm" id="asm-end">End Test</button>
        </div>
        <div style="flex:1; overflow-y:auto; padding:1.5rem;" id="asm-body"></div>
      </div>`;

    $("#asm-end").onclick = () => {
      dialog(`
        <h2 class="dialog-title">End Test</h2>
        <p class="dialog-desc">Are you sure want to submit the assessment ? This cannot be undone.</p>
        <div class="dialog-footer">
          <button class="btn btn-destructive" id="ae-no">Close</button>
          <button class="btn btn-primary" id="ae-yes">Submit</button>
        </div>`);
      $("#ae-no").onclick = closeDialog;
      $("#ae-yes").onclick = () => finalizeAttempt(false);
    };

    paintMcq();
    paintCode();
    startTimer();
    trackTabSwitches();
  }

  function paintMcq() {
    const body = $("#asm-body");
    if (d.mcqs.length === 0) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <h3 style="font-weight:700; margin-bottom:0.75rem;">Section 1 — MCQ (${d.mcqs.length})</h3>
      <div class="practice-panels" style="width:100%; height:auto; min-height:22rem;">
        <div class="ppanel">
          <div class="p-head">Question : <span id="am-num">1</span>&nbsp;/&nbsp;${d.mcqs.length}</div>
          <div class="p-body" id="am-qbody"></div>
          <div class="p-foot left">Marks : 1</div>
        </div>
        <div class="ppanel">
          <div class="p-head">Answer here</div>
          <div class="p-body" id="am-abody"></div>
          <div class="p-foot"><button class="btn btn-green" id="am-next">Next ${icon("arrowR", "ic")}</button></div>
        </div>
      </div>`;
    body.appendChild(wrap);

    let mi = 0;
    const paintM = () => {
      const q = d.mcqs[mi];
      $("#am-num").textContent = mi + 1;
      $("#am-qbody").innerHTML = `
        <div class="q-title">${esc(q.title)}</div>
        <div class="q-desc">${esc(q.description)}</div>
        ${q.iscodesnippet && q.codesnippet ? `<pre class="codesnippet">${esc(q.codesnippet)}</pre>` : ""}`;
      $("#am-abody").innerHTML = q.options.map((o, i) => `
        <div class="opt-row ${A.answers[q.id] === i + 1 ? "selected" : ""}" data-opt="${i + 1}">
          <span class="radio-dot"></span><span>${esc(o)}</span></div>`).join("");
      $$("#am-abody .opt-row").forEach((el) =>
        el.addEventListener("click", () => {
          A.answers[q.id] = Number(el.dataset.opt);
          $$("#am-abody .opt-row").forEach((x) => x.classList.remove("selected"));
          el.classList.add("selected");
        })
      );
      $("#am-next").disabled = mi >= d.mcqs.length - 1;
    };
    $("#am-next").onclick = () => { if (mi < d.mcqs.length - 1) { mi += 1; paintM(); } };
    paintM();
  }

  function paintCode() {
    const body = $("#asm-body");
    if (d.code.length === 0) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `<h3 style="font-weight:700; margin:1.5rem 0 0.75rem;">Section 2 — Coding (${d.code.length})</h3>`;
    body.appendChild(wrap);

    d.code.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "practice-panels";
      card.style.cssText = "width:100%; height:auto; min-height:20rem; margin-bottom:1.25rem;";
      card.innerHTML = `
        <div class="ppanel">
          <div class="p-head">Question : ${qi + 1}&nbsp;/&nbsp;${d.code.length}</div>
          <div class="p-body">
            <div class="q-title">${esc(q.title)}</div>
            <div class="q-desc">${esc(q.description)}</div>
            ${q.sampleinput1 ? `<div style="width:100%"><b class="small">Sample Input</b><pre class="codesnippet">${esc(q.sampleinput1)}</pre><b class="small">Sample Output</b><pre class="codesnippet">${esc(q.sampleoutput1)}</pre></div>` : ""}
          </div>
          <div class="p-foot left">Max Score : ${q.maxscore ?? 10}</div>
        </div>
        <div class="ppanel">
          <div class="p-head">Write your code ${q.questionstatus ? '<span class="badge badge-green" style="margin-left:auto;">submitted</span>' : ""}</div>
          <div style="height:70%; width:100%; padding:0.75rem 1rem;">
            <div class="editor-wrap ${document.body.classList.contains("dark") ? "" : "light"}" style="height:100%;">
              <div class="editor-head">${langIcon(q.lang)} <b>${esc((q.lang || "").toUpperCase())}</b></div>
              <textarea class="editor-area" data-code="${esc(q.id)}" spellcheck="false">${esc(q.lastcode || "// code here ! \n\n")}</textarea>
            </div>
          </div>
          <div class="p-foot" style="gap:0.5rem;">
            <button class="btn btn-outline btn-sm" data-airun="${esc(q.id)}">${icon("sparkles", "ic sm")} AI</button>
            <button class="btn btn-outline btn-sm" data-run="${esc(q.id)}">${icon("clock", "ic sm")} Run Testcases</button>
            <span class="spacer"></span>
            <button class="btn btn-green btn-sm" data-save="${esc(q.id)}">Save</button>
          </div>
        </div>`;
      body.appendChild(card);

      const runBtn = $(`[data-run="${q.id}"]`, card);
      runBtn.onclick = async () => {
        const code = $(`[data-code="${q.id}"]`, card).value;
        runBtn.disabled = true;
        try {
          const r = await runQuestionCode({ q, code, mode: "tests", assessmentId: A.aid });
          A.codeRuns[q.id] = { statuses: [r.testcase1status, r.testcase2status, r.testcase3status], passed: r.passedCount, code, saved: false };
          const band = (n, st) => `<span class="badge ${st === "pass" ? "badge-green" : st === "error" ? "badge-red" : "badge-orange"}">T${n}: ${st || "—"}</span>`;
          toast(`${r.passedCount}/3 test cases passed — ${r.passedCount * 3} marks earned (of 9) + 1 sample bonus on save`);
          runBtn.insertAdjacentHTML("beforebegin", `<span class="row" data-res="${q.id}" style="gap:0.25rem;">${band(1, r.testcase1status)}${band(2, r.testcase2status)}${band(3, r.testcase3status)}</span>`);
        } catch (e) { toast(e.message, "error"); }
        runBtn.disabled = false;
      };

      const saveBtn = $(`[data-save="${q.id}"]`, card);
      saveBtn.onclick = async () => {
        const code = $(`[data-code="${q.id}"]`, card).value;
        const run = A.codeRuns[q.id];
        if (!run) { toast("Run the test cases first — they are graded on save.", "warning"); return; }
        saveBtn.disabled = true;
        try {
          await apiOrThrow(`/student/assessments/${A.aid}/submit`, {
            method: "POST",
            body: {
              uaid: A.uaid, finalize: false,
              code: [{
                questionId: q.id, usercode: code,
                score: run.passed * 3,
                compiles: 1, errors: run.statuses.filter((s) => s === "error").length,
                testcase1status: run.statuses[0], testcase2status: run.statuses[1], testcase3status: run.statuses[2],
                duration: 0,
              }],
            },
          });
          q.questionstatus = true;
          run.saved = true;
          toast("Solution saved !");
          const head = card.querySelector(".p-head .badge");
          if (!head) $(".p-head", card).insertAdjacentHTML("beforeend", '<span class="badge badge-green" style="margin-left:auto;">submitted</span>');
        } catch (e) { toast(e.message, "error"); }
        saveBtn.disabled = false;
      };

      const aiBtn = $(`[data-airun="${q.id}"]`, card);
      aiBtn.onclick = () => {
        const code = $(`[data-code="${q.id}"]`, card).value;
        openSheet(`
          <div class="sheet-head">${icon("sparkles", "ic")} ATOM AI <span class="spacer"></span>
            <button class="btn btn-ghost btn-sm" id="ai-close">${icon("x", "ic sm")}</button></div>
          <div class="sheet-body" id="ai-log"><div class="ai-msg">Analyzing <b>${esc(q.title)}</b>…</div></div>
          <div class="sheet-foot">
            <input class="inp" id="ai-input" placeholder="Ask for a hint…" style="flex:1;" />
            <button class="btn btn-primary" id="ai-send">${icon("send", "ic sm")}</button>
          </div>`);
        $("#ai-close").onclick = closeSheet;
        const ask = async (useCode) => {
          try {
            const r = await apiOrThrow("/student/ai", { method: "POST", body: { questionId: q.id, assessmentId: A.aid, code: useCode ? code : null } });
            $("#ai-log").insertAdjacentHTML("beforeend", `<div class="ai-msg">${esc(r.reply)}</div>`);
          } catch (e) {
            $("#ai-log").insertAdjacentHTML("beforeend", `<div class="ai-msg" style="color:var(--destructive)">${esc(e.message)}</div>`);
          }
          $("#ai-log").scrollTop = $("#ai-log").scrollHeight;
        };
        ask(true);
        $("#ai-send").onclick = () => ask(false);
      };
    });
  }

  function startTimer() {
    const paintT = () => {
      const el = $("#asm-timer");
      if (!el) return;
      el.innerHTML = `${icon("clock", "ic sm")} ${fmtSecs(A.remaining)}`;
      el.classList.toggle("danger", A.remaining < 300);
    };
    paintT();
    A.timer = setInterval(() => {
      A.remaining -= 1;
      paintT();
      if (A.remaining <= 0) {
        clearInterval(A.timer);
        toast("Time is up — submitting your assessment…", "warning");
        finalizeAttempt(true);
      }
    }, 1000);
  }

  function trackTabSwitches() {
    const onBlur = () => {
      if (state.assessment !== A) return window.removeEventListener("blur", onBlur);
      A.tabCount += 1;
      const el = $("#tab-count");
      if (el) el.textContent = A.tabCount;
      if (A.detail.attemptState.maxtabswitches && A.tabCount >= A.detail.attemptState.maxtabswitches) {
        toast("Tab switch limit reached — test will be submitted.", "warning");
        finalizeAttempt(true);
      } else {
        toast(`Warning: tab switch ${A.tabCount}/${A.detail.attemptState.maxtabswitches}`, "warning");
      }
    };
    window.addEventListener("blur", onBlur);
  }
}

async function finalizeAttempt(auto) {
  const A = state.assessment;
  if (!A) return;
  closeDialog();
  try {
    // MCQ answers (graded server-side) + any code runs (saved or pending)
    const mcqAnswers = Object.entries(A.answers || {}).map(([mcqId, selected]) => ({ mcqId, selected }));
    const codePayload = Object.entries(A.codeRuns || {}).map(([questionId, run]) => ({
      questionId,
      usercode: run.code,
      score: run.passed * 3,
      compiles: 1,
      errors: run.statuses.filter((s) => s === "error").length,
      testcase1status: run.statuses[0],
      testcase2status: run.statuses[1],
      testcase3status: run.statuses[2],
      duration: 0,
    }));

    const r = await apiOrThrow(`/student/assessments/${A.aid}/submit`, {
      method: "POST",
      body: { uaid: A.uaid, mcq: { answers: mcqAnswers }, code: codePayload, finalize: true },
    });

    if (A.timer) clearInterval(A.timer);
    closePractice();
    dialog(`
      <h2 class="dialog-title">${auto ? "Time's up — assessment submitted" : "Assessment submitted !"}</h2>
      <div class="row" style="justify-content:center; gap:1rem;">
        <div class="card card-pad" style="text-align:center;"><div style="font-size:1.6rem;font-weight:800;color:var(--primary)">${r.scores.mcq.earned}/${r.scores.mcq.total}</div><div class="muted small">MCQ</div></div>
        <div class="card card-pad" style="text-align:center;"><div style="font-size:1.6rem;font-weight:800;color:var(--primary)">${r.scores.code.earned}/${r.scores.code.total}</div><div class="muted small">Coding</div></div>
        <div class="card card-pad" style="text-align:center;"><div style="font-size:1.6rem;font-weight:800;color:var(--primary)">${r.scores.overall.earned}/${r.scores.overall.total}</div><div class="muted small">Overall</div></div>
      </div>
      <div class="dialog-footer single"><button class="btn btn-primary" id="fr-ok">View Results</button></div>`, { wide: true });
    $("#fr-ok").onclick = () => { closeDialog(); state.assessment = null; navigate("assessments"); };
    state.assessment = null;
    toast("Assessment submitted successfully");
  } catch (e) {
    toast(e.message, "error");
  }
}

/* ============================== settings ============================== */

async function renderSettings(v) {
  const [profileRes, configRes] = await Promise.all([
    api("/student/profile"),
    api("/config", { silent401: true }),
  ]);
  const p = profileRes.ok ? profileRes.data.user : state.user;
  const cfg = configRes.ok ? configRes.data : {};

  v.innerHTML = `
    <div class="settings-grid">
      <div>
        <div class="card card-pad">
          <div class="settings-card-head">
            <h3 style="font-weight:700;">Profile</h3>
            <button class="edit-icon-btn" id="edit-profile" title="Edit profile">${icon("edit", "ic")}</button>
          </div>
          <div class="form-grid" style="grid-template-columns:1fr 1fr;">
            <div class="field"><label class="muted small">Name</label><span>${esc(p.name || "—")}</span></div>
            <div class="field"><label class="muted small">Email</label><span>${esc(p.email)}</span></div>
            <div class="field"><label class="muted small">Department</label><span>${esc(p.department || "—")}</span></div>
            <div class="field"><label class="muted small">Section</label><span>${esc(p.section || "—")}</span></div>
            <div class="field"><label class="muted small">Batch</label><span>${esc(p.batch || "—")}</span></div>
            <div class="field"><label class="muted small">Roll Number</label><span>${esc(p.rollnumber || "—")}</span></div>
            <div class="field"><label class="muted small">Phone</label><span>${esc(p.phone || "—")}</span></div>
            <div class="field"><label class="muted small">GitHub</label><span>${esc(p.github || "—")}</span></div>
          </div>
        </div>

        <div class="card card-pad mt2">
          <div class="settings-card-head"><h3 style="font-weight:700;">Password & Security</h3></div>
          <p class="muted small mb2">Change your account password regularly to keep your account safe.</p>
          <button class="btn btn-primary" id="open-password">${icon("key", "ic sm")} Change Password</button>
        </div>
      </div>

      <div>
        <div class="card card-pad">
          <h3 style="font-weight:700;" class="mb2">Server Connection</h3>
          <div class="field mb2">
            <label class="muted small">Server address</label>
            <input class="inp" id="st-server" value="${esc(state.serverUrl)}" />
          </div>
          <button class="btn" id="st-reconnect">Reconnect</button>
          <div class="muted small mt2">
            Code execution: ${cfg.codeExecution?.sampleRun ? '<span class="badge badge-green">available</span>' : '<span class="badge badge-orange">not configured</span>'}<br/><br/>
            Hidden test runs: ${cfg.codeExecution?.testCasesRun ? '<span class="badge badge-green">available</span>' : '<span class="badge badge-orange">not configured</span>'}<br/><br/>
            ATOM AI tutor: ${cfg.aiTutorEnabled ? '<span class="badge badge-green">enabled</span>' : '<span class="badge">disabled</span>'}
          </div>
        </div>
        <div class="card card-pad mt2">
          <h3 style="font-weight:700;" class="mb1">About</h3>
          <p class="muted small" id="st-about">AtomCode Student Desktop v2.0</p>
        </div>
      </div>
    </div>`;

  $("#edit-profile").onclick = () => {
    dialog(`
      <h2 class="dialog-title">Edit Profile</h2>
      <div class="form-grid" style="margin-top:0.75rem;">
        <div class="field"><label>Name</label><input class="inp" id="pf-name" value="${esc(p.name || "")}" /></div>
        <div class="field"><label>Department</label><input class="inp" id="pf-dept" value="${esc(p.department || "")}" /></div>
        <div class="field"><label>Section</label><input class="inp" id="pf-sec" value="${esc(p.section || "")}" /></div>
        <div class="field"><label>Batch</label><input class="inp" id="pf-batch" value="${esc(p.batch || "")}" /></div>
        <div class="field"><label>Roll number</label><input class="inp" id="pf-roll" value="${esc(p.rollnumber || "")}" /></div>
        <div class="field"><label>Phone</label><input class="inp" id="pf-phone" value="${esc(p.phone || "")}" /></div>
        <div class="field full"><label>GitHub</label><input class="inp" id="pf-gh" value="${esc(p.github || "")}" /></div>
        <div class="field full"><label>LinkedIn</label><input class="inp" id="pf-li" value="${esc(p.linkedin || "")}" /></div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-destructive" id="pf-cancel">Cancel</button>
        <button class="btn btn-primary" id="pf-save">Save</button>
      </div>`, { wide: true });
    $("#pf-cancel").onclick = closeDialog;
    $("#pf-save").onclick = async () => {
      $("#pf-save").disabled = true;
      try {
        const r = await apiOrThrow("/student/profile", {
          method: "PATCH",
          body: {
            name: $("#pf-name").value.trim() || null,
            department: $("#pf-dept").value.trim() || null,
            section: $("#pf-sec").value.trim() || null,
            batch: $("#pf-batch").value.trim() || null,
            rollnumber: $("#pf-roll").value.trim() || null,
            phone: $("#pf-phone").value.trim() || null,
            github: $("#pf-gh").value.trim() || null,
            linkedin: $("#pf-li").value.trim() || null,
          },
        });
        state.user = { ...state.user, ...r.user };
        localStorage.setItem(LS.user, JSON.stringify(state.user));
        $("#tb-name").textContent = state.user.name || "Student";
        $("#tb-avatar").textContent = initials(state.user.name);
        closeDialog();
        toast("Profile updated !");
        renderSettings(v);
      } catch (e) { toast(e.message, "error"); $("#pf-save").disabled = false; }
    };
  };

  $("#open-password").onclick = () => {
    dialog(`
      <h2 class="dialog-title">Change Password</h2>
      <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.75rem;">
        <div class="field"><label>Current password</label><input class="inp" id="pw-cur" type="password" /></div>
        <div class="field"><label>New password (min 6 chars)</label><input class="inp" id="pw-new" type="password" /></div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-destructive" id="pw-cancel">Cancel</button>
        <button class="btn btn-primary" id="pw-save">Update</button>
      </div>`);
    $("#pw-cancel").onclick = closeDialog;
    $("#pw-save").onclick = async () => {
      $("#pw-save").disabled = true;
      try {
        const r = await apiOrThrow("/student/profile/password", {
          method: "POST",
          body: { currentPassword: $("#pw-cur").value, newPassword: $("#pw-new").value },
        });
        closeDialog();
        toast(r.message || "Password updated !");
      } catch (e) { toast(e.message, "error"); $("#pw-save").disabled = false; }
    };
  };

  $("#st-reconnect").onclick = async () => {
    const url = $("#st-server").value.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(url)) return toast("Server address must start with http:// or https://", "error");
    state.serverUrl = url;
    localStorage.setItem(LS.server, url);
    const res = await app.api({ serverUrl: url, path: "/config" });
    toast(res.ok ? "Connected to server" : res.data?.error || "Cannot reach server", res.ok ? "success" : "error");
    if (res.ok) renderSettings(v);
  };

  const info = await app.info();
  $("#st-about").innerHTML =
    `AtomCode Student Desktop v2.0<br/>Electron ${info.electron} · Chromium ${info.chrome} · Node ${info.node}<br/>Platform: ${info.platform}`;
}

/* ============================== boot ============================== */

/* inject static icons into shell chrome */
$$("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

window.addEventListener("DOMContentLoaded", boot);
