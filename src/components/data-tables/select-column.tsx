"use client"

import * as React from "react"
import { ColumnDef, Table } from "@tanstack/react-table"
import { CheckCheck, ChevronDown, ListX, SquareAsterisk } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const SELECT_COLUMN_ID = "select"

/**
 * Header cell for the selection column.
 *
 * - The checkbox itself toggles "all rows on the current page" and shows an
 *   indeterminate state when only some page rows are selected.
 * - The chevron opens a dropdown with page-wide / table-wide (filtered)
 *   select-all options and a clear-selection action, so users can control
 *   selection across pages (selection is kept while paging/filtering).
 */
function SelectAllHeader<TData>({ table }: { table: Table<TData> }) {
  const allPageSelected = table.getIsAllPageRowsSelected()
  const somePageSelected = table.getIsSomePageRowsSelected()
  const filteredCount = table.getFilteredRowModel().rows.length
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="flex items-center justify-start gap-0.5 pl-1">
      <Checkbox
        checked={
          allPageSelected || (somePageSelected && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
        className="translate-y-[2px]"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 hover:bg-muted-foreground/20"
            aria-label="Open selection options"
          >
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            onClick={() => table.toggleAllPageRowsSelected(true)}
            disabled={allPageSelected}
          >
            <SquareAsterisk className="size-4" />
            Select all on this page
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => table.toggleAllRowsSelected(true)}
            disabled={selectedCount === filteredCount}
          >
            <CheckCheck className="size-4" />
            Select all ({filteredCount})
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => table.resetRowSelection()}
            disabled={selectedCount === 0}
            className="text-destructive focus:text-destructive"
          >
            <ListX className="size-4" />
            Clear selection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Reusable TanStack-Table selection column (checkbox per row + select-all
 * header). Prepend it to any `columns` array:
 *
 * ```ts
 * const allColumns = useMemo(
 *   () => [makeSelectColumn<TData>() as ColumnDef<TData, TValue>, ...columns],
 *   [columns]
 * )
 * ```
 *
 * Tables using this column MUST set `getRowId` to the entity's unique id so
 * the selection survives sorting, filtering and pagination.
 */
export function makeSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: SELECT_COLUMN_ID,
    header: ({ table }) => <SelectAllHeader<TData> table={table} />,
    cell: ({ row }) => (
      <div
        className="flex items-center pl-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[1px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
