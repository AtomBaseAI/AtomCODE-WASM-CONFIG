"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ExportSelectedCsvButtonProps<TData> {
  table: Table<TData>
  /** Download file name (without extension). */
  filename: string
  /**
   * Columns to export. `key` supports dot notation for nested fields
   * (e.g. "user.name") and is resolved against the row's original object.
   */
  columns: { key: string; label: string }[]
}

function getPath(obj: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc != null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      obj
    )
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Exports only the currently selected table rows to a downloadable CSV.
 * Render nothing when no rows are selected.
 */
export function ExportSelectedCsvButton<TData>({
  table,
  filename,
  columns,
}: ExportSelectedCsvButtonProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) return null

  const handleExport = () => {
    const header = columns.map((c) => escapeCsvCell(c.label)).join(",")
    const lines = selectedRows.map((row) =>
      columns
        .map((c) => escapeCsvCell(getPath(row.original, c.key)))
        .join(",")
    )
    const csv = "\uFEFF" + [header, ...lines].join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={handleExport}
      aria-label="Export selected rows to CSV"
    >
      <Download className="size-4" />
      Export CSV
      <span className="text-muted-foreground tabular-nums">
        ({selectedRows.length})
      </span>
    </Button>
  )
}
