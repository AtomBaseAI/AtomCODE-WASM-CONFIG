/**
 * Central route registry (unified app).
 * Original apps had unprefixed paths that collided when merged;
 * every role area now lives under its own prefix.
 */

export const publicRoutes = ["/"];
export const authRoutes = ["/login", "/register"];
export const apiAuthPrefix = "/api/auth";

export const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  user: "/student/dashboard",
};

export function roleHome(role?: string | null): string {
  return ROLE_HOME[role ?? ""] ?? "/login";
}

/** Default post-login redirect (role resolved at sign-in). */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
