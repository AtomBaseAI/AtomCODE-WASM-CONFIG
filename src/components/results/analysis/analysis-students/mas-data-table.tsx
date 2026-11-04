"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/data-tables/data-table-pagination"
import { makeSelectColumn } from "@/components/data-tables/select-column"
import { BulkActionBar } from "@/components/data-tables/bulk-action-bar"
import { ExportSelectedCsvButton } from "@/components/data-tables/export-selected-csv"
import { MASDataTableToolbar } from "@/components/results/analysis/analysis-students/mas-data-table-toolbar"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function ResultAnalysisStudentsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const allColumns = React.useMemo(
    () =>
      [
        makeSelectColumn<TData>() as ColumnDef<TData, TValue>,
        ...columns,
      ] as ColumnDef<TData, TValue>[],
    [columns]
  )

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => String((row as { userid?: string }).userid ?? ""),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <MASDataTableToolbar table={table} />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <BulkActionBar table={table}>
        <ExportSelectedCsvButton
          table={table}
          filename="student-analysis"
          columns={[
            { key: "name", label: "Name" },
            { key: "rollnumber", label: "Rollnumber" },
            { key: "batch", label: "Batch" },
            { key: "department", label: "Department" },
            { key: "section", label: "Section" },
            { key: "status", label: "Status" },
            { key: "mcqScore", label: "MCQ Score" },
            { key: "maxmcqscore", label: "Max MCQ Score" },
            { key: "codeScore", label: "Code Score" },
            { key: "maxcodescore", label: "Max Code Score" },
            { key: "totalScore", label: "Total Score" },
            { key: "maxScore", label: "Max Score" },
            { key: "time", label: "Time (s)" },
          ]}
        />
      </BulkActionBar>
    </div>
  )
}
