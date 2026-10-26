import { db } from "@/lib/db";
import type { MCQQuestion, CodeQuestion, User } from "@prisma/client";

/**
 * Shared helpers for the desktop (Electron) API routes.
 * Keeps question payloads safe: correct answers never leave the server and
 * hidden test cases are only shipped for the languages the desktop client
 * executes locally with its bundled runtimes (same trust level as the web
 * app, which always judges those client-side).
 */

/**
 * Languages the Electron desktop client executes locally with its bundled
 * runtimes (same built-in engine as the web app). Hidden test cases for
 * these languages are shipped to the client so it can judge runs offline.
 * Compiled languages (C, C++, Java — see NATIVE_LANGUAGES in
 * native-executor.ts) stay server-judged via /api/desktop/run and their
 * hidden test data never leaves the server.
 */
export const DESKTOP_ENGINE_LANGUAGES = [
  "python",
  "sql",
  "ruby",
  "javascript",
  "typescript",
] as const;

export function safeProfile(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    department: user.department,
    section: user.section,
    batch: user.batch,
    rollnumber: user.rollnumber,
    github: user.github,
    linkedin: user.linkedin,
    phone: user.phone,
  };
}

export function sanitizeMcq(mcq: MCQQuestion) {
  return {
    id: mcq.id,
    title: mcq.title,
    description: mcq.description,
    topic: mcq.topic,
    subtopic: mcq.subtopic,
    options: [mcq.Option1, mcq.Option2, mcq.Option3, mcq.Option4],
    codesnippet: mcq.codesnippet,
    iscodesnippet: mcq.iscodesnippet,
    referenceimg: mcq.referenceimg,
  };
}

export function sanitizeCodeQuestion(
  q: CodeQuestion,
  opts?: { includeHiddenTests?: boolean }
) {
  const base = {
    id: q.id,
    title: q.title,
    description: q.description,
    lang: q.lang,
    maxscore: q.maxscore,
    difficulty: q.difficulty,
    topic: q.topic,
    subtopic: q.subtopic,
    inputconstrains: q.inputconstrains,
    // not secret — the web client uses these for client-side guardrails too
    blacklist: q.blacklist,
    whitelist: q.whitelist,
    sourcecode: q.sourcecode,
    referenceimg: q.referenceimg,
    sampleinput1: q.sampleinput1,
    sampleinput2: q.sampleinput2,
    sampleoutput1: q.sampleoutput1,
    sampleoutput2: q.sampleoutput2,
  };

  // Hidden test cases are shipped only for the languages the desktop client
  // executes with its own bundled runtimes (client-side judging, same as the
  // web app). For C/C++/Java they stay server-side inside /api/desktop/run.
  if (opts?.includeHiddenTests) {
    return {
      ...base,
      input1: q.input1,
      input2: q.input2,
      input3: q.input3,
      output1: q.output1,
      output2: q.output2,
      output3: q.output3,
    };
  }
  return base;
}

/** Ensures the student is actively enrolled in the given course. */
export async function isEnrolled(userId: string, courseId: string) {
  const enrollment = await db.userCourse.findFirst({
    where: { userId, courseId, active: true },
  });
  return Boolean(enrollment);
}

/** Ensures the student is enrolled in the course that owns the module. */
export async function isEnrolledInModule(userId: string, moduleId: string) {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return { ok: false, module: null };
  const ok = await isEnrolled(userId, mod.courseId);
  return { ok, module: mod };
}

/** Creates the UserModuleData tracking row if it doesn't exist yet.
 * Mirrors the web startModule flow: MCQs are worth 1 mark each, every code
 * question is worth 10 marks (1 sample + 3 hidden tests × 3). */
export async function ensureUserModuleData(
  userId: string,
  courseId: string,
  moduleId: string
) {
  const existing = await db.userModuleData.findFirst({
    where: { userId, courseId, moduleId },
  });
  if (existing) return existing;

  const counts = await db.module.findUnique({
    where: { id: moduleId },
    select: { maxscore: true, _count: { select: { mcqQuestions: true, codeQuestions: true } } },
  });

  return db.userModuleData.create({
    data: {
      userId,
      courseId,
      moduleId,
      modulemaxscore: counts?.maxscore ?? 0,
      modulestatus: "started",
      totalmcqscore: counts?._count.mcqQuestions ?? 0,
      totalquestionscore: (counts?._count.codeQuestions ?? 0) * 10,
    },
  });
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Seconds left in an assessment that started at IST "HH:mm" with an "HH:mm"
 * (h:mm) duration. Timezone-safe: anchors the IST wall-clock to absolute UTC
 * instants instead of the server's local timezone (the server may run UTC
 * while the app and its users live in Asia/Kolkata).
 */
export function remainingSecondsIST(startHHmm: string, maxtime: string): number {
  const [sh, sm] = String(startHHmm).split(":").map(Number);
  const [mh, mm] = String(maxtime).split(":").map(Number);
  if ([sh, sm, mh, mm].some((n) => Number.isNaN(n))) return 0;

  const IST_OFFSET_MS = 5.5 * 3_600_000;
  const istNow = new Date(Date.now() + IST_OFFSET_MS); // shifted wall clock
  const istMidnightAsUtc = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate()
  );
  const startMs = istMidnightAsUtc + (sh * 60 + sm) * 60_000 - IST_OFFSET_MS;
  const endMs = startMs + (mh * 60 + mm) * 60_000;
  const diff = endMs - Date.now();
  return diff > 0 ? Math.floor(diff / 1000) : 0;
}

/** Current IST "HH:mm" — mirrors the web app's assessment clock. */
export function currentISTTime(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    if (type !== "literal") map[type] = value;
  });
  return `${map.hour}:${map.minute}`;
}

/** YYYY-MM-DD in IST. */
export function currentISTDayKey(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    if (type !== "literal") map[type] = value;
  });
  return `${map.year}-${map.month}-${map.day}`;
}
