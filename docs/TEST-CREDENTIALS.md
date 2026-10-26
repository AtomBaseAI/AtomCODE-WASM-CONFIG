# AtomCode (unified app) — Test Credentials

Sample accounts seeded by `prisma/seed.ts` (idempotent — safe to re-run).
All passwords are plain values below; the DB stores bcrypt hashes.

**Login URL:** `/login`  **Register URL:** `/register`
**Forgot password (stub):** `/forgot-password` — route-parity only; no email reset implemented.
**Assessment access key:** `123456` (seeded assessment "Unit Test 1", course "Full Stack Java")

## Account Matrix

| Email | Password | Role | Landing page after login | What to test |
|---|---|---|---|---|
| admin@atom.com | Admin@Atom | Admin | `/admin/dashboard` | Course CRUD, questions, MCQs, assessments, staff/students management, results |
| admin2@atom.com | Admin@Atom | Admin | `/admin/dashboard` | Secondary admin account (same capabilities) |
| staff@atom.com | Staff@Atom | Staff | `/staff/dashboard` | Enrolled in "Full Stack Java": module views, references, feedbacks, results analysis, workspace, IDE |
| staff2@atom.com | Staff@Atom | Staff | `/staff/dashboard` | NO courses — tests empty states across staff pages |
| student@atom.com | User@Atom | Student | `/student/dashboard` | Enrolled: courses, practice MCQ/code, assessments (accesskey 123456), settings, AI tutor |
| student2@atom.com | User@Atom | Student | `/student/dashboard` | Enrolled — gives the course leaderboard 2+ students for variety |
| student3@atom.com | User@Atom | Student | `/student/dashboard` | NOT enrolled — tests empty states across student pages |

## Seeded Course Data

- Course: **Full Stack Java** (language: java)
- Modules: "Java Basics" (2 MCQs + 2 coding questions), "OOP in Java" (1 MCQ)
- Assessment: **Unit Test 1**, access key **123456**, 1 coding question ("Reverse String")
- Feedback: "Session 1 Feedback" (form link)
- Enrollments: staff@atom.com (StaffCourse), student@atom.com + student2@atom.com (UserCourse); staff2/student3 intentionally unenrolled

## Environment Essentials (7 vars — reduced from ~14 in the original apps)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path for Prisma (`file:.../db/custom.db`) |
| `AUTH_SECRET` | next-auth v5 session signing secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_LAMBDA_URL` | *(web app no longer uses it)* code runs with the app's built-in execution engine; kept only for the desktop client proxy (`/api/desktop/run`) |
| `NEXT_PUBLIC_LAMBDA_MULTI_URL` | *(web app no longer uses it)* same as above |
| `OPENAI_API_KEY` | ATOM AI tutor (student AI sheet); optional — empty disables it |
| `OPENAI_MODEL` | Model for the AI tutor (default `gpt-4o-mini`) |

## Web code execution (built-in engine)

Code in the web app (Open IDE, practice, assessments, question authoring)
compiles and runs with the app's built-in execution engine — no external
judge API. Runtime profiles live in `src/lib/runtime-registry.ts`;
versioned runtimes are self-hosted under `public/runtimes/` (CPython
3.11/3.12/3.13/3.14, SQLite 3.54, Ruby 3.4, OpenJDK 8 javac; C/C++/Java
execute via the built-in server toolchains). Rebuild workers after changes
with `bun run workers:build`; re-sync runtime assets with
`bun run runtimes:sync`.

Branding vars were replaced by defaults in `src/config/branding.ts` and can optionally be
overridden via env: `NEXT_PUBLIC_CLIENT_NAME`, `NEXT_PUBLIC_CLIENT_BANNER`,
`NEXT_PUBLIC_VENDOR_NAME`, `NEXT_PUBLIC_VENDOR_LOGO`, `NEXT_PUBLIC_POWEREDBY_STATUS/NAME/URL`,
`NEXT_PUBLIC_APP_STATUS`. See `.env.example` for the full annotated list.

## Notes

- `.env` (repo root) holds real values; `.env.example` holds placeholders + comments. `.env` is git-ignored.
- Seed command: `cd /home/z/my-project/atomcode-repatch && DATABASE_URL="file:/home/z/my-project/atomcode-repatch/db/custom.db" bun prisma/seed.ts`
  (⚠️ if a parent `/home/z/my-project/.env` exists, bun's parent-directory auto-load can override `--env-file`; the inline `DATABASE_URL` above avoids that).
- Post-seed counts: Admin=2, Staff=2, User(student)=3, Course=1, UserCourse=2, StaffCourse=1, Assessments=1.
