"use client"

// Magic UI — Border Beam
// https://magicui.design/docs/components/border-beam
// A beam of light traveling around the border of its (relative) parent.

import * as React from "react"
import {
  motion,
  type MotionStyle,
  type Transition,
} from "framer-motion"

import { cn } from "@/lib/utils"

export interface BorderBeamProps {
  className?: string
  /** Length (px) of the beam along the travel direction (the visible trail). */
  size?: number
  /** Thickness (px) of the beam across the border; defaults to `size` (square). */
  thickness?: number
  /** Seconds for one full loop around the border. */
  duration?: number
  /** Width (px) of the beam track drawn on the parent border. */
  borderWidth?: number
  /** Starting position (%) along the border; 0 = full loop from top-left. */
  anchor?: number
  colorFrom?: string
  colorTo?: string
  /** Seconds to offset the start (negative-delay trick), for multi-beam setups. */
  delay?: number
}

export function BorderBeam({
  className,
  size = 50,
  thickness,
  duration = 6,
  borderWidth = 1.5,
  anchor = 90,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}: BorderBeamProps) {
  const beamThickness = thickness ?? size

  return (
    <>
      {/* Border track: visible only on the parent border via mask composite */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [border-width:var(--border-beam-width)]"
        style={
          {
            "--border-beam-width": `${borderWidth}px`,
          } as React.CSSProperties
        }
      />
      {/* The traveling beam */}
      <motion.div
        className={cn(
          "absolute bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className
        )}
        style={
          {
            width: size,
            height: beamThickness,
            offsetPath: `rect(0 auto auto 0 round ${beamThickness}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
          } as MotionStyle
        }
        initial={{ offsetDistance: "0%" }}
        animate={{
          offsetDistance: anchor
            ? [`${anchor}%`, `${anchor + 360}%`]
            : ["0%", "100%"],
        }}
        transition={
          {
            repeat: Infinity,
            ease: "linear",
            duration,
            delay: -delay,
          } as Transition
        }
      />
    </>
  )
}
