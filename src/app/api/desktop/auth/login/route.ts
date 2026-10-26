import { NextResponse } from "next/server";
import { compare } from "bcrypt-ts";
import { db } from "@/lib/db";
import {
  createDesktopToken,
  json,
  fail,
  CORS_HEADERS,
} from "@/lib/desktop-auth";
import { safeProfile } from "@/lib/desktop-helpers";

/**
 * POST /api/desktop/auth/login
 * Student-only login for the Electron desktop client.
 * Returns a signed Bearer token + safe profile.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return fail(400, "Email and password are required");
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Helpful error when the credentials belong to a staff/admin account —
      // this desktop client is student-only.
      const isAdmin = await db.admin.findUnique({ where: { email } });
      const isStaff = await db.staff.findUnique({ where: { email } });
      if (isAdmin || isStaff) {
        return fail(403, "This desktop app is for student accounts only");
      }
      return fail(401, "Invalid email or password");
    }

    if (!user.isActive) {
      return fail(403, "Your account has been deactivated. Contact your admin.");
    }

    const match = await compare(password, user.password);
    if (!match) {
      return fail(401, "Invalid email or password");
    }

    const token = createDesktopToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return json({ token, user: safeProfile(user) });
  } catch (e) {
    console.error("[desktop/login]", e);
    return fail(500, "Login failed — unexpected server error");
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
