import { json, preflight, CORS_HEADERS } from "@/lib/desktop-auth";

/**
 * GET /api/desktop/config — public client configuration.
 * Tells the desktop app which optional backend services are configured
 * without leaking any secrets or URLs (execution is proxied server-side).
 */
export async function GET() {
  return json({
    appName: "AtomCode Student Desktop",
    clientName:
      process.env.NEXT_PUBLIC_CLIENT_NAME || "Atom Code Campus",
    vendorName:
      process.env.NEXT_PUBLIC_VENDOR_NAME || "AtomBase AI",
    codeExecution: {
      sampleRun: Boolean(process.env.NEXT_PUBLIC_LAMBDA_URL),
      testCasesRun: Boolean(process.env.NEXT_PUBLIC_LAMBDA_MULTI_URL),
    },
    aiTutorEnabled: Boolean(process.env.OPENAI_API_KEY),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
