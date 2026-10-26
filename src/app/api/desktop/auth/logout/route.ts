import { json, preflight, authGuard } from "@/lib/desktop-auth";

/**
 * POST /api/desktop/auth/logout
 * Tokens are stateless (HMAC signed) — the client discards it locally.
 * This endpoint exists so the client can confirm the token is still valid
 * and keep the flow symmetrical.
 */
export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  return json({
    success: true,
    message: "Logged out — discard the token on the client",
  });
}

export async function OPTIONS() {
  return preflight();
}
