"use client"

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"
import { cn } from "@/lib/utils"
import { Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/**
 * App-wide theme switcher — Magic UI AnimatedThemeToggler (circular reveal via
 * the View Transitions API) driven in controlled mode by next-themes, so every
 * useTheme() subscriber (CodeMirror editor themes, toolbars, ...) stays in sync
 * and persistence stays owned by next-themes instead of raw localStorage.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  // next-themes can only resolve the persisted theme on the client, so
  // `resolvedTheme` is `undefined` while SSR-ing (server renders the light
  // default -> Moon) but may resolve to "dark" on the client (Sun) — a
  // hydration mismatch. Render a placeholder that exactly matches the SSR
  // output until after mount, then swap in the real toggler.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const classes = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-black shadow-none transition-colors hover:bg-transparent hover:text-primary dark:text-white",
    className
  )

  if (!mounted) {
    return (
      <button type="button" className={classes} disabled>
        <Moon />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={(theme) => setTheme(theme)}
      className={classes}
    />
  )
}
