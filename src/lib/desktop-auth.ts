import crypto from "crypto";
import { NextResponse } from "next/server";
import { compare } from "bcrypt-ts";
import { db } from "@/lib/db";
import { AUTH_SECRET_FALLBACK } from "@/lib/auth-secret";

/**
 * Token-based auth for the Electron desktop client (students only).
 *
 * The web app relies on next-auth session cookies, but a desktop client
 * cannot (and should not) share those. Instead each desktop route verifies
 * an HMAC-SHA256 signed token issued by POST /api/desktop/auth/login.
 *
 * The signing secret matches the web session secret semantics:
 * process.env.AUTH_SECRET when present, AUTH_SECRET_FALLBACK otherwise.
 */

export type DesktopSession = {
  sub: string; // student (User) id
  email: string;
  name: string | null;
  role: "user";
  iat: number;
  exp: number;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const getSecret = () => process.env.AUTH_SECRET || AUTH_SECRET_FALLBACK;

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

const sign = (data: string) =>
  crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");

export function createDesktopToken(payload: {
  sub: string;
  email: string;
  name: string | null;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const body: DesktopSession = {
    ...payload,
    role: "user",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const payloadB64 = b64url(JSON.stringify(body));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyDesktopToken(token: string | null): DesktopSession | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as DesktopSession;
    if (!session?.sub || session.role !== "user") return null;
    if (typeof session.exp !== "number" || session.exp * 1000 < Date.now())
      return null;
    return session;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return null;
}

/**
 * Verifies the Bearer token AND loads the student row from the DB,
 * making sure the account still exists and is active.
 * Returns null when unauthorized — routes respond with 401/403.
 */
export async function requireDesktopStudent(req: Request) {
  const session = verifyDesktopToken(extractToken(req));
  if (!session) return null;

  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.isActive) return null;

  return { session, user };
}

/* ------------------------------------------------------------------ */
/* Shared helpers used by every desktop route                          */
/* ------------------------------------------------------------------ */

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
};

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function fail(status: number, error: string, extra?: Record<string, unknown>) {
  return json({ error, ...(extra ?? {}) }, { status });
}

export async function authGuard(req: Request) {
  const ctx = await requireDesktopStudent(req);
  if (!ctx) return { ctx: null, response: fail(401, "Unauthorized — invalid or expired token") };
  return { ctx, response: null };
}

export { compare as comparePasswords };
