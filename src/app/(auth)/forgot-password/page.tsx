import Link from "next/link";

/**
 * Route-parity stub. The original admin app shipped a bare `ForgotPassword`
 * page (no email-reset flow was ever implemented), so the unified app keeps
 * the same minimal page so /forgot-password resolves.
 */
export default function ForgotPassword() {
  return (
    <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center gap-4">
      <div>ForgotPassword</div>
      <Link
        href="/login"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
