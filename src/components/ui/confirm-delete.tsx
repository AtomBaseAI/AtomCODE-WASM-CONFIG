"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** The exact lowercase phrase that enables the delete button. */
export const CONFIRM_DELETE_PHRASE = "confirm delete"

/** Camel-case display version shown in the label / input placeholder. */
export const CONFIRM_DELETE_HINT = "Confirm Delete"

/**
 * Sanitizes typed confirmation text:
 * - folds every letter to lowercase (input "accepts only small case letters")
 * - strips anything that is not a lowercase letter or a space
 * - collapses repeated spaces and caps the length
 */
export function normalizeConfirmText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z ]+/g, "")
    .replace(/ {2,}/g, " ")
    .slice(0, 24)
}

export function isConfirmDeleteText(value: string): boolean {
  return value.trim() === CONFIRM_DELETE_PHRASE
}

interface ConfirmDeleteInputProps {
  value: string
  onValueChange: (value: string) => void
  /** Optional explicit id; a unique auto id is generated when omitted. */
  id?: string
  className?: string
  autoFocus?: boolean
}

/**
 * Typed-confirmation field for destructive (delete) dialogs.
 *
 * Shows the camel-case phrase ("Confirm Delete") as the label and inside the
 * input placeholder, but only accepts lowercase letters: whatever the user
 * types is folded to lowercase and stripped of invalid characters, so the
 * effective confirmation is always `confirm delete`.
 *
 * Wire it up as:
 *   const [confirmText, setConfirmText] = useState("")
 *   <ConfirmDeleteInput value={confirmText} onValueChange={setConfirmText} />
 *   <Button disabled={isLoading || !isConfirmDeleteText(confirmText)} ... />
 */
export function ConfirmDeleteInput({
  value,
  onValueChange,
  id,
  className,
  autoFocus,
}: ConfirmDeleteInputProps) {
  const autoId = React.useId()
  const inputId = id ?? `confirm-delete${autoId}`
  const confirmed = isConfirmDeleteText(value)
  const dirty = value.trim().length > 0 && !confirmed

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label
        htmlFor={inputId}
        className="text-sm leading-none font-medium select-none"
      >
        Type{" "}
        <span className="text-primary font-semibold">
          &quot;{CONFIRM_DELETE_HINT}&quot;
        </span>{" "}
        below to enable delete
      </label>
      <Input
        id={inputId}
        name="confirmDelete"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-label={`Type ${CONFIRM_DELETE_HINT} in lowercase letters to confirm deletion`}
        placeholder={CONFIRM_DELETE_HINT}
        value={value}
        onChange={(event) => onValueChange(normalizeConfirmText(event.target.value))}
        onPaste={(event) => {
          // Paste is allowed but goes through the same lowercase sanitizer
          event.preventDefault()
          onValueChange(normalizeConfirmText(event.clipboardData.getData("text")))
        }}
        onDrop={(event) => event.preventDefault()}
        aria-invalid={dirty || undefined}
        data-confirmed={confirmed || undefined}
        className={cn(
          "font-mono",
          confirmed &&
            "border-emerald-500/60 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500",
        )}
      />
      {dirty && (
        <p className="text-destructive text-xs">
          Must match &quot;{CONFIRM_DELETE_PHRASE}&quot; exactly (small letters only).
        </p>
      )}
    </div>
  )
}
