/**
 * Runtime registry — the single source of truth for every executable
 * language/version combination shipped with the app (design doc §2, §3.2).
 *
 * Two execution backends are used:
 * - "wasm-runtime" / "transpile" / "browser-native" / "database" profiles run
 *   via the bundled Web Workers under public/workers/.
 * - "native-server" profiles execute with the server's built-in toolchains
 *   (gcc / g++ / ECJ + OpenJDK JVM — no external API, no keys) through
 *   POST /api/execute/native. The browser C interpreter previously used
 *   (JSCPP) could not parse real C++ (no `::` operator in its grammar), so
 *   the compiled languages use real compilers instead.
 *
 * Version dimensions kept per profile (doc §2):
 * - languageVersion: Python 3.13 vs 3.14, Java 8 vs 11 vs 17 ...
 * - compilerVersion: GCC 14.2 / g++ 14.2 / ECJ 3.27 / TypeScript 5.9 ...
 * - runtimeVersion : the executing engine description (internal metadata —
 *   never rendered in the UI; dropdowns show the plain version label).
 */

export type LanguageId =
  | "c"
  | "cpp"
  | "java"
  | "python"
  | "sql"
  | "javascript"
  | "typescript"
  | "ruby";

export type ExecutionMode =
  | "browser-native"
  | "transpile"
  | "wasm-runtime"
  | "native-server"
  | "database";

export type WorkerKind =
  | "javascript"
  | "typescript"
  | "python"
  | "sqlite"
  | "ruby";

export interface RuntimeProfile {
  id: string;
  language: LanguageId;
  label: string;
  languageVersion: string;
  compilerVersion?: string;
  runtimeVersion: string;
  mode: ExecutionMode;
  workerKind?: WorkerKind;
  verified: boolean;
  features: {
    stdin: boolean;
    packages: boolean;
    persistentState: boolean;
  };
  /** Origin-relative base path of the pinned runtime assets (browser runtimes). */
  runtimeBasePath?: string;
  /** Terminate the pooled worker after each run (cheap runtimes). */
  disposeAfterRun?: boolean;
  /** Default execution timeout used by the execution manager. */
  defaultTimeoutMs: number;
  /** UI ordering weight inside a language's version dropdown. */
  order: number;
}

export const LANGUAGES: {
  id: LanguageId;
  label: string;
  /** Which select groups the language appears in. */
  group: "core" | "web";
}[] = [
  // First-order languages (per product requirement): C, C++, Java, Python, SQL
  { id: "c", label: "C", group: "core" },
  { id: "cpp", label: "C++", group: "core" },
  { id: "java", label: "Java", group: "core" },
  { id: "python", label: "Python", group: "core" },
  { id: "sql", label: "SQL (SQLite)", group: "core" },
  // Remaining languages
  { id: "javascript", label: "JavaScript", group: "web" },
  { id: "typescript", label: "TypeScript", group: "web" },
  { id: "ruby", label: "Ruby", group: "web" },
];

const NATIVE_SERVER_NOTE = "AtomCode toolchain";

export const runtimeProfiles: RuntimeProfile[] = [
  // ───────────── C (GNU GCC — server's built-in native toolchain) ─────────────
  {
    id: "c-c99",
    language: "c",
    label: "C 99",
    languageVersion: "C99 (-std=c99)",
    compilerVersion: "GCC 14.2",
    runtimeVersion: `GCC 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 1,
  },
  {
    id: "c-c11",
    language: "c",
    label: "C 11",
    languageVersion: "C11 (-std=c11)",
    compilerVersion: "GCC 14.2",
    runtimeVersion: `GCC 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 2,
  },
  {
    id: "c-c17",
    language: "c",
    label: "C 17",
    languageVersion: "C17 (-std=c17)",
    compilerVersion: "GCC 14.2",
    runtimeVersion: `GCC 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 3,
  },
  // ──────────── C++ (GNU g++ — server's built-in native toolchain) ────────────
  {
    id: "cpp-cpp11",
    language: "cpp",
    label: "C++ 11",
    languageVersion: "C++11 (-std=c++11)",
    compilerVersion: "g++ 14.2",
    runtimeVersion: `g++ 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 1,
  },
  {
    id: "cpp-cpp14",
    language: "cpp",
    label: "C++ 14",
    languageVersion: "C++14 (-std=c++14)",
    compilerVersion: "g++ 14.2",
    runtimeVersion: `g++ 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 2,
  },
  {
    id: "cpp-cpp17",
    language: "cpp",
    label: "C++ 17",
    languageVersion: "C++17 (-std=c++17)",
    compilerVersion: "g++ 14.2",
    runtimeVersion: `g++ 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 3,
  },
  {
    id: "cpp-cpp20",
    language: "cpp",
    label: "C++ 20",
    languageVersion: "C++20 (-std=c++20)",
    compilerVersion: "g++ 14.2",
    runtimeVersion: `g++ 14.2 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 10_000,
    order: 4,
  },
  // ───────────────────── Java (ECJ batch compiler + OpenJDK JVM) ──────────────
  {
    id: "java-8",
    language: "java",
    label: "Java 8",
    languageVersion: "8 (-source/-target 8)",
    compilerVersion: "ECJ 3.27.0 (Eclipse batch compiler)",
    runtimeVersion: `OpenJDK 21 JVM, bytecode target 8 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 30_000,
    order: 1,
  },
  {
    id: "java-11",
    language: "java",
    label: "Java 11",
    languageVersion: "11 (-source/-target 11)",
    compilerVersion: "ECJ 3.27.0 (Eclipse batch compiler)",
    runtimeVersion: `OpenJDK 21 JVM, bytecode target 11 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 30_000,
    order: 2,
  },
  {
    id: "java-17",
    language: "java",
    label: "Java 17",
    languageVersion: "17 (-source/-target 17)",
    compilerVersion: "ECJ 3.33.0 (Eclipse batch compiler)",
    runtimeVersion: `OpenJDK 21 JVM, bytecode target 17 · ${NATIVE_SERVER_NOTE}`,
    mode: "native-server",
    verified: true,
    features: { stdin: true, packages: false, persistentState: false },
    defaultTimeoutMs: 30_000,
    order: 3,
  },
  // ─────────────────────── Python (CPython runtimes) ──────────────────────────
  {
    id: "python-3.11",
    language: "python",
    label: "Python 3.11",
    languageVersion: "3.11",
    runtimeVersion: "CPython 3.11",
    mode: "wasm-runtime",
    workerKind: "python",
    verified: true,
    features: { stdin: true, packages: true, persistentState: false },
    runtimeBasePath: "/runtimes/pyodide/0.25.1/",
    disposeAfterRun: false,
    defaultTimeoutMs: 20_000,
    order: 1,
  },
  {
    id: "python-3.12",
    language: "python",
    label: "Python 3.12",
    languageVersion: "3.12",
    runtimeVersion: "CPython 3.12",
    mode: "wasm-runtime",
    workerKind: "python",
    verified: true,
    features: { stdin: true, packages: true, persistentState: false },
    runtimeBasePath: "/runtimes/pyodide/0.26.4/",
    disposeAfterRun: false,
    defaultTimeoutMs: 20_000,
    order: 2,
  },
  {
    id: "python-3.13",
    language: "python",
    label: "Python 3.13",
    languageVersion: "3.13",
    runtimeVersion: "CPython 3.13",
    mode: "wasm-runtime",
    workerKind: "python",
    verified: true,
    features: { stdin: true, packages: true, persistentState: false },
    runtimeBasePath: "/runtimes/pyodide/0.28.3/",
    disposeAfterRun: false,
    defaultTimeoutMs: 20_000,
    order: 3,
  },
  {
    id: "python-3.14",
    language: "python",
    label: "Python 3.14",
    languageVersion: "3.14",
    runtimeVersion: "CPython 3.14",
    mode: "wasm-runtime",
    workerKind: "python",
    verified: true,
    features: { stdin: true, packages: true, persistentState: false },
    runtimeBasePath: "/runtimes/pyodide/314.0.7/",
    disposeAfterRun: false,
    defaultTimeoutMs: 20_000,
    order: 4,
  },
  // ─────────────────────────── SQL (SQLite) ────────────────────────────────
  {
    id: "sqlite-3.54",
    language: "sql",
    label: "SQLite 3.54",
    languageVersion: "SQLite 3 (SQLite dialect)",
    compilerVersion: "SQLite 3.54.1",
    runtimeVersion: "SQLite 3.54.1 (in-memory)",
    mode: "database",
    workerKind: "sqlite",
    verified: true,
    features: { stdin: false, packages: false, persistentState: false },
    runtimeBasePath: "/runtimes/sqlite-wasm/",
    disposeAfterRun: false,
    defaultTimeoutMs: 10_000,
    order: 1,
  },
  // ─────────────────────── JavaScript ────────────────────────────────────────
  {
    id: "javascript-browser",
    language: "javascript",
    label: "JavaScript",
    languageVersion: "ES2024 (browser-supported ECMAScript)",
    runtimeVersion: "JavaScript engine (isolated worker)",
    mode: "browser-native",
    workerKind: "javascript",
    verified: true,
    features: { stdin: false, packages: false, persistentState: false },
    disposeAfterRun: true,
    defaultTimeoutMs: 5_000,
    order: 1,
  },
  // ──────────────── TypeScript (pinned tsc transpile → engine) ─────────────────
  {
    id: "typescript-5.9",
    language: "typescript",
    label: "TypeScript 5.9",
    languageVersion: "5.9",
    compilerVersion: "TypeScript 5.9.3 (transpileModule → ES2022)",
    runtimeVersion: "JavaScript engine (isolated worker)",
    mode: "transpile",
    workerKind: "typescript",
    verified: true,
    features: { stdin: false, packages: false, persistentState: false },
    disposeAfterRun: true,
    defaultTimeoutMs: 8_000,
    order: 1,
  },
  // ─────────────────────────── Ruby ──────────────────────────────────────────
  {
    id: "ruby-3.4",
    language: "ruby",
    label: "Ruby 3.4",
    languageVersion: "3.4",
    compilerVersion: "Ruby 3.4 toolchain",
    runtimeVersion: "CRuby 3.4 + stdlib",
    mode: "wasm-runtime",
    workerKind: "ruby",
    verified: true,
    features: { stdin: false, packages: false, persistentState: true },
    runtimeBasePath: "/runtimes/ruby/3.4/",
    disposeAfterRun: false,
    defaultTimeoutMs: 20_000,
    order: 1,
  },
];

/* ────────────────────────────── lookup helpers ────────────────────────────── */

export function getLanguageLabel(lang: string): string {
  return LANGUAGES.find((l) => l.id === lang)?.label ?? lang;
}

export function getProfilesForLanguage(lang: string): RuntimeProfile[] {
  return runtimeProfiles
    .filter((p) => p.language === lang)
    .sort((a, b) => a.order - b.order);
}

export function getProfileById(id: string): RuntimeProfile | undefined {
  return runtimeProfiles.find((p) => p.id === id);
}

/** First verified profile for a language, falling back to the first listed. */
export function getDefaultProfileForLanguage(
  lang: string
): RuntimeProfile | undefined {
  const profiles = getProfilesForLanguage(lang);
  return profiles.find((p) => p.verified) ?? profiles[0];
}

/**
 * Resolve the profile to execute: the explicitly selected version profile,
 * falling back to the remembered per-language choice and finally the default.
 */
export function resolveProfile(
  lang: string,
  versionProfileId?: string | null
): RuntimeProfile | undefined {
  if (versionProfileId) {
    const profile = getProfileById(versionProfileId);
    if (profile && profile.language === lang) return profile;
  }
  return getDefaultProfileForLanguage(lang);
}

/** Languages that can be selected for courses/questions in this build. */
export const COURSE_LANGUAGE_IDS: LanguageId[] = LANGUAGES.map((l) => l.id);

export function isCourseLanguage(lang: string): boolean {
  return COURSE_LANGUAGE_IDS.includes(lang as LanguageId);
}

/* ────────────────────── per-language version persistence ─────────────────── */

const VERSION_KEY_PREFIX = "atomcode:runtime-version:";

export function getStoredVersionForLang(lang: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(VERSION_KEY_PREFIX + lang);
  } catch {
    return null;
  }
}

export function setStoredVersionForLang(lang: string, profileId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VERSION_KEY_PREFIX + lang, profileId);
  } catch {
    // storage unavailable (private mode) — selection is session-only
  }
}

/**
 * Resolve the UI's starting selection for a language: stored choice if still
 * valid, otherwise the language default.
 */
export function getInitialVersionProfileId(lang: string): string | undefined {
  const stored = getStoredVersionForLang(lang);
  if (stored && getProfileById(stored)?.language === lang) return stored;
  return getDefaultProfileForLanguage(lang)?.id;
}
