/**
 * Fallback session signing secret.
 *
 * Deployment platforms may regenerate `.env` on workspace resume, wiping
 * AUTH_SECRET while keeping DATABASE_URL. Without a fallback every login
 * breaks: MissingSecret -> 500 on /api/auth/callback/credentials (route
 * context) and silent session-decode failure in middleware (bounce loop).
 *
 * Used by src/auth.ts (NextAuth instances) and src/middleware.ts (JWT
 * decode) so signing and decoding always share the same effective secret:
 * process.env.AUTH_SECRET when present, this constant otherwise.
 */
export const AUTH_SECRET_FALLBACK =
  "atomcode-sandbox-f5c3a9e1b7d24608a0d1c2e3b4a5f607";
