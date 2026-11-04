"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BulkActionBarProps<TData> {
  table: Table<TData>
  /** Bulk action buttons rendered inside the floating bar. */
  children?: React.ReactNode
}

/**
 * Floating action bar shown at the bottom-center of the viewport whenever
 * one or more table rows are selected. Displays the selection count, the
 * provided bulk actions and a clear-selection button.
 */
export function BulkActionBar<TData>({
  table,
  children,
}: BulkActionBarProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  if (selectedCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="pointer-events-auto flex max-w-[95vw] flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2 pl-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <span className="whitespace-nowrap text-sm font-medium tabular-nums">
          {selectedCount} row{selectedCount === 1 ? "" : "s"} selected
        </span>
        {children ? (
          <div className="flex flex-wrap items-center gap-1.5">{children}</div>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => table.resetRowSelection()}
          aria-label="Clear selection"
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
