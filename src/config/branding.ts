/**
 * White-label branding config (replaces the 8 scattered NEXT_PUBLIC_*
 * branding env vars of the original student app with one place + defaults).
 */
const env = (key: string, fallback: string) =>
  process.env[key] && process.env[key] !== "" ? process.env[key]! : fallback;

export const CLIENT_NAME = env(
  "NEXT_PUBLIC_CLIENT_NAME",
  "Atom Code Campus"
);
export const CLIENT_BANNER = env(
  "NEXT_PUBLIC_CLIENT_BANNER",
  "https://ik.imagekit.io/atominc/ATOMCODE/banner.webp"
);
export const VENDOR_NAME = env("NEXT_PUBLIC_VENDOR_NAME", "Atom Code");
export const VENDOR_LOGO = env(
  "NEXT_PUBLIC_VENDOR_LOGO",
  "https://ik.imagekit.io/atominc/academy-mini.webp"
);
export const POWEREDBY_STATUS =
  env("NEXT_PUBLIC_POWEREDBY_STATUS", "false") === "true";
export const POWEREDBY_NAME = env("NEXT_PUBLIC_POWEREDBY_NAME", "AtomLabs");
export const POWEREDBY_URL = env("NEXT_PUBLIC_POWEREDBY_URL", "#");

/** "true" enables the login form; anything else shows the maintenance screen. */
export const APP_STATUS = env("NEXT_PUBLIC_APP_STATUS", "true");
