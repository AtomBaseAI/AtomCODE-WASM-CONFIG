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
import { CDataTableToolbar } from "@/components/course/course-table/c-data-table-toolbar"
import { usePathname } from "next/navigation"
import { makeSelectColumn } from "@/components/data-tables/select-column"
import { BulkActionBar } from "@/components/data-tables/bulk-action-bar"
import { BulkActionButton } from "@/components/data-tables/bulk-action-button"
import { ExportSelectedCsvButton } from "@/components/data-tables/export-selected-csv"
import { deletecoursesbulk } from "@/actions/course"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function CourseDataTable<TData, TValue>({
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

  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith("/admin") ?? false

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
    getRowId: (row) => String((row as { id?: string }).id ?? ""),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <CDataTableToolbar table={table} />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} >
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
        {isAdminArea ? (
          <BulkActionButton
            table={table}
            action={deletecoursesbulk}
            label="Delete"
            dialogTitle="Delete selected courses"
            dialogDescription="Courses still containing modules, assessments or enrollments cannot be deleted and will be skipped. This action cannot be undone."
            requirePhrase
          />
        ) : (
          <ExportSelectedCsvButton
            table={table}
            filename="courses"
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Course" },
              { key: "language", label: "Language" },
              { key: "startdate", label: "Start Date" },
              { key: "enddate", label: "End Date" },
              { key: "modulescount", label: "Modules" },
              { key: "assessmentscount", label: "Assessments" },
            ]}
          />
        )}
      </BulkActionBar>
    </div>
  )
}
