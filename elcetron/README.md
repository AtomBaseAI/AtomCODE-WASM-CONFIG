# AtomCode Student — Desktop Client (Electron)

A student-only desktop client for the **AtomCode** learning platform, built with
Electron + vanilla HTML/CSS/JS (no build step). It talks to the Next.js backend
through a dedicated token-authenticated API at `/api/desktop/*`.

> Note: the folder is intentionally named `elcetron` (as requested).

## Features

- 🔐 **Student-only login** — staff/admin credentials are rejected with a clear message
- 📊 **Dashboard** — enrolled courses, module progress, average score, assessment readiness
- 📚 **My Courses** — progress bars per course → active modules with MCQ/code status
- 🧠 **MCQ practice** — options A–D, server-side grading (correct answers never sent to the client)
- 💻 **Code practice** — editor with tab support, *Run sample* / *Run hidden tests* executed with the **built-in compilers** (same engine as the web app: bundled runtimes run locally in the client; C/C++/Java compile & run on the server's built-in toolchains — no external judge API)
- ⏱ **Assessments** — access-key entry, countdown timer, MCQ + coding sections, final submit
- 🏆 **Results** — module and assessment score tables
- ⚙️ **Settings** — profile editing, password change, server address, service status

## Run it

```bash
cd elcetron
npm install        # or: bun install
npm start          # or: bun start / npx electron .
```

The app opens a login window:

| Field | Value |
|---|---|
| Server address | `http://localhost:3000` (default — change it to your deployed AtomCode URL) |
| Email | any seeded student, e.g. `student@atom.com` |
| Password | `User@Atom` |

> Useful env: `ATOMCODE_URL=http://localhost:3000 npm start` loads a live web page
> inside the shell instead of the bundled renderer (development helper).

## How auth works

1. `POST /api/desktop/auth/login` verifies the student email/password (bcrypt) and
   returns an **HMAC-SHA256 signed token** (7-day TTL, same secret family as web sessions).
2. Every subsequent call sends `Authorization: Bearer <token>`.
3. Tokens are stateless — logout simply discards them client-side.

The token, profile and server URL are persisted in `localStorage`.

## Built-in code execution engine

The desktop client packages the **same built-in execution engine as the web
app** — no external judge service is involved anywhere:

| Languages | Where it runs | How |
|---|---|---|
| Python (3.11–3.14), SQL (SQLite 3.54), Ruby 3.4, JavaScript, TypeScript 5.9 | **locally in the desktop app** | The web app's worker bundles + runtime builds are packaged under `renderer/workers/` and `renderer/runtimes/` and executed in Web Workers from the privileged `atomcode://renderer` origin. Hidden test cases for these languages are judged client-side (same trust level as the web app). |
| C, C++, Java 8/11/17 | **on the connected AtomCode server** | `POST /api/desktop/run` drives the server's built-in gcc / g++ / ECJ+JVM toolchains. Expected outputs of hidden test cases never leave the server. |

The renderer assets are served from the `atomcode://renderer/…` scheme
(registered in `main.js`) so Workers, dynamic imports and streaming
WebAssembly behave exactly like on the web app's origin.

Keep the bundled engine in sync with the web app after changing workers or
runtime assets:

```bash
cd elcetron
npm run sync:engine   # copies ../public/workers + ../public/runtimes/{pyodide,sqlite-wasm,ruby}
npm run selftest      # end-to-end engine test in Node (real worker bundles + runtimes, no display needed)
```

`npm run build` / `npm run export` re-sync automatically (pre-hooks).

## Backend endpoints consumed

All endpoints live under `/api/desktop` on the Next.js server:

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | Student login → token |
| `/auth/me` | GET | Current profile |
| `/auth/logout` | POST | Logout handshake |
| `/config` | GET | Public service flags (judge/AI availability) |
| `/student/dashboard` | GET | Aggregated stats |
| `/student/courses` | GET | Enrolled courses + progress |
| `/student/courses/[cid]/modules` | GET | Active modules + per-module progress |
| `/student/modules/[mid]` | GET | Sanitized MCQs/code questions/references/progress |
| `/student/practice/module` | POST | Start/submit module tracking |
| `/student/practice/mcq` | POST | Submit MCQ attempt (graded server-side) |
| `/student/practice/code` | POST | Submit coding solution |
| `/run` | POST | Built-in server toolchains for C/C++/Java (sample + hidden tests) |
| `/student/assessments` | GET | Assessments with dynamic status |
| `/student/assessments/[aid]/start` | POST | Access-key validation → open/resume attempt |
| `/student/assessments/[aid]` | GET | Attempt detail (sanitized questions) |
| `/student/assessments/[aid]/submit` | POST | Save MCQ/code results + finalize |
| `/student/results` | GET | Module + assessment results |
| `/student/profile` | GET / PATCH | Profile read/update |
| `/student/profile/password` | POST | Change password |

## Security notes

- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`; HTTP is
  proxied through the main process (no CORS exposure).
- Correct MCQ options never leave the server. Hidden test-case data is shipped
  **only** for the locally-executed languages (Python/SQL/Ruby/JS/TS — same
  trust level as the web app); for C/C++/Java the expected outputs stay
  server-side and only pass/fail verdicts return.
- The app never calls any external judge/API service — code execution is fully
  built-in (local runtimes + the platform server's own toolchains).

## Project layout

```
elcetron/
├── main.js            # Electron main process + IPC HTTP proxy + atomcode:// static server
├── preload.js         # contextBridge (window.atomcode)
├── scripts/
│   └── sync-engine-assets.mjs   # packages web app workers + runtimes into the renderer
├── renderer/
│   ├── index.html     # login + app shell
│   ├── styles.css     # violet shadcn theme (light/dark)
│   ├── app.js         # views: dashboard, courses, practice, assessments, results, settings
│   ├── engine/
│   │   └── atom-engine.js  # built-in execution engine (registry + worker pool + judge)
│   ├── workers/       # runtime worker bundles (synced from ../public/workers)
│   └── runtimes/      # pyodide / sqlite-wasm / ruby builds (synced from ../public/runtimes)
├── assets (icons) also under renderer/assets/
├── package.json
└── README.md
```

## Build & Distribute

Packaging uses **electron-builder** (config lives in the `"build"` field of
`package.json`; output goes to `dist/`).

```bash
npm install          # once (installs electron + electron-builder)

npm run build        # unpacked build for the current OS  -> dist/<os>-unpacked/
npm run export       # installers for the current OS
npm run export:linux # AppImage + .deb
npm run export:win   # NSIS installer + portable .exe (x64)
npm run export:mac   # .dmg + .zip
npm run export:all   # tries all three platforms at once
```

Notes:
- `npm run build` is a fast sanity check (no installer); run the produced
  binary from `dist/linux-unpacked/` etc. to smoke-test.
- From **Linux**, `export:win` additionally requires **wine**
  (`sudo apt install wine64`) because Windows exe resources must be edited;
  `export:mac` must be run on **macOS**.
- Installer names follow `${productName}-${version}-${os}-${arch}.${ext}`,
  e.g. `AtomCode Student-1.0.0-linux-x86_64.AppImage`.
- Windows NSIS installer is user-level (not one-click), lets the user pick the
  install folder and creates desktop/start-menu shortcuts ("AtomCode Student").
- `dist/` is git-ignored.
