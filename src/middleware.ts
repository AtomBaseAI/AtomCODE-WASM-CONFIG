import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  roleHome,
} from "@/routes";
import { AUTH_SECRET_FALLBACK } from "@/lib/auth-secret";

/**
 * Standalone edge middleware (no Prisma / no NextAuth runtime here).
 * Reads the next-auth v5 JWE session cookie and enforces role-based
 * area guards: /admin/**, /staff/**, /student/**.
 */

const COOKIE_SALTS = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

async function getSessionRole(req: NextRequest): Promise<{
  role?: string;
  loggedIn: boolean;
}> {
  const raw =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;
  if (!raw) return { loggedIn: false };

  // Same effective secret as src/auth.ts: env when present, shared
  // fallback otherwise — otherwise a wiped AUTH_SECRET makes this
  // middleware treat freshly-issued sessions as logged-out (login bounce).
  const secret = process.env.AUTH_SECRET || AUTH_SECRET_FALLBACK;
  if (!secret) return { loggedIn: false };

  for (const salt of COOKIE_SALTS) {
    try {
      const token = await decode({
        token: raw,
        secret,
        salt,
      });
      if (token) {
        return { role: (token as any).role, loggedIn: true };
      }
    } catch {
      // try next salt
    }
  }
  return { loggedIn: false };
}

const ROLE_PREFIX: Record<string, string[]> = {
  "/admin": ["admin"],
  "/staff": ["staff"],
  "/student": ["user"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Desktop (Electron) client API — authenticates itself via Bearer tokens
  // inside each route handler; never apply cookie-based page guards here.
  if (pathname.startsWith("/api/desktop")) return NextResponse.next();

  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

  const { role, loggedIn } = await getSessionRole(req);

  const isAuthRoute = authRoutes.includes(pathname);
  if (isAuthRoute) {
    if (loggedIn) {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    return NextResponse.next();
  }

  const isPublic = publicRoutes.includes(pathname);
  if (isPublic) {
    if (loggedIn) {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    return NextResponse.next();
  }

  // Role-area guards
  for (const [prefix, allowed] of Object.entries(ROLE_PREFIX)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!loggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (!allowed.includes(role ?? "")) {
        return NextResponse.redirect(new URL(roleHome(role), req.url));
      }
      return NextResponse.next();
    }
  }

  if (!loggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
