import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import { BorderBeam } from "@/components/magicui/border-beam";
import { HexagonPattern } from "@/components/magicui/hexagon-pattern";
import { Card } from "@/components/ui/card";
import {
  APP_STATUS,
  CLIENT_BANNER,
  CLIENT_NAME,
  POWEREDBY_NAME,
  POWEREDBY_STATUS,
  POWEREDBY_URL,
  VENDOR_LOGO,
  VENDOR_NAME,
} from "@/config/branding";

export default function Login() {
  return (
    <div className="relative flex min-h-svh flex-col bg-muted/40 p-4 dark:bg-background md:p-6 lg:p-8">
      {/* Magic UI hexagon pattern — page background, fades from top-left toward bottom-right */}
      <HexagonPattern
        radius={40}
        x={-1}
        y={-1}
        className="[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
      />

      {/* Page header — brand logo left, theme toggle right */}
      <header className="z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Image
            src={VENDOR_LOGO}
            alt={`${VENDOR_NAME} logo`}
            height={20}
            width={20}
          />
          {VENDOR_NAME}
        </div>
        <ThemeToggle />
      </header>

      {/* Login card — 50% banner | 50% form, Magic UI border beam */}
      <main className="flex flex-1 items-center justify-center py-6">
        <Card className="relative w-full max-w-4xl overflow-hidden rounded-2xl py-0 shadow-xl">
          <BorderBeam
            size={96}
            thickness={6}
            duration={20}
            colorFrom="#8b5cf6"
            colorTo="#d946ef"
          />
          <BorderBeam
            size={96}
            thickness={6}
            duration={20}
            delay={10}
            anchor={270}
            colorFrom="#d946ef"
            colorTo="#8b5cf6"
          />

          <div className="grid lg:grid-cols-2">
            {/* Left — banner panel (50%) */}
            <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted p-8 lg:flex dark:border-border dark:bg-zinc-900">
              <div className="relative flex w-full flex-1 items-center justify-center py-6">
                <Image
                  src={CLIENT_BANNER}
                  width={1280}
                  height={800}
                  priority
                  alt="Authentication"
                  className="h-auto w-full rounded-2xl shadow-lg dark:shadow-none"
                />
              </div>

              {POWEREDBY_STATUS && (
                <div className="relative z-20">
                  <blockquote className="space-y-2">
                    <p className="text-lg">
                      Powered by{" "}
                      <span className="text-blue-600 font-bold">
                        <a
                          href={POWEREDBY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {POWEREDBY_NAME}
                        </a>
                      </span>
                    </p>
                  </blockquote>
                </div>
              )}
            </div>

            {/* Right — form (50%) */}
            <div className="flex items-center justify-center p-6 md:p-10">
              <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {CLIENT_NAME}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email &amp; password below to login your account
                  </p>
                </div>

                {APP_STATUS === "true" ? (
                  <LoginForm />
                ) : (
                  <div>
                    <p className="text-center text-yellow-600">
                      The application is currently under Maintenance !{" "}
                    </p>
                    <br />
                    <p className="text-center">Please try again later.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
