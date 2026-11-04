"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Table } from "@tanstack/react-table"
import { LoaderIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ConfirmDeleteInput,
  isConfirmDeleteText,
} from "@/components/ui/confirm-delete"

/** Standardized result shape returned by every bulk server action. */
export type BulkActionResult = {
  success?: string
  error?: string
  /** Rows that could not be processed (e.g. non-empty courses/modules). */
  skipped?: number
}

interface BulkActionButtonProps<TData> {
  table: Table<TData>
  /** Bulk server action; receives the ids of every selected row. */
  action: (ids: string[]) => Promise<BulkActionResult>
  /** Button label, e.g. "Delete". */
  label: string
  /** Dialog title, e.g. "Delete 3 students". */
  dialogTitle: string
  /** Dialog body explaining the consequence of the action. */
  dialogDescription: string
  /** Force typing the confirmation phrase before enabling the action. */
  requirePhrase?: boolean
  /** Extract the entity id from a row (defaults to `row.id`). */
  getId?: (row: TData) => string
  /** Show a red trash icon on the button (default true for destructive actions). */
  destructive?: boolean
  icon?: React.ReactNode
}

/**
 * Confirmation-guarded bulk action button for data tables. Collects the ids
 * of all selected rows, asks for confirmation (optionally a typed phrase for
 * destructive operations), runs the server action and reports the outcome.
 */
export function BulkActionButton<TData>({
  table,
  action,
  label,
  dialogTitle,
  dialogDescription,
  requirePhrase = false,
  getId,
  destructive = true,
  icon,
}: BulkActionButtonProps<TData>) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const getIds = () =>
    selectedRows.map((row) => {
      if (getId) return String(getId(row.original))
      const original = row.original as { id?: unknown }
      return String(original.id ?? row.id)
    })

  const canConfirm = !requirePhrase || isConfirmDeleteText(confirmText)

  const handleAction = async () => {
    const ids = getIds()
    if (ids.length === 0) return
    setIsLoading(true)
    try {
      const result = await action(ids)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
        if (typeof result?.skipped === "number" && result.skipped > 0) {
          toast.info(
            `${result.skipped} row(s) skipped — they are still referenced by other data.`
          )
        }
        table.resetRowSelection()
        setOpen(false)
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setConfirmText("")
        setOpen(o)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          className={
            destructive
              ? "h-8 gap-1.5 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
              : "h-8 gap-1.5"
          }
        >
          {icon ?? (destructive ? <Trash2 className="size-4" /> : null)}
          {label}
          <span className="text-muted-foreground tabular-nums">
            ({selectedCount})
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {requirePhrase ? (
            <ConfirmDeleteInput value={confirmText} onValueChange={setConfirmText} />
          ) : null}
          <DialogFooter className="grid w-full grid-cols-2 gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button className="w-full">Cancel</Button>
            </DialogClose>
            <Button
              variant={destructive ? "destructive" : "default"}
              className="w-full"
              disabled={isLoading || !canConfirm}
              onClick={handleAction}
            >
              {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
              {label}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
