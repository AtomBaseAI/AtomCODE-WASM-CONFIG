"use client"

import * as React from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Eye, FolderOpen } from "lucide-react"

import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { DataTablePagination } from "@/components/data-tables/data-table-pagination"
import { DataTableViewOptions } from "@/components/data-tables/data-table-view-options"
import { GroupFormDialog } from "@/components/question-group/group-form-dialog"
import { GroupDeleteDialog } from "@/components/question-group/group-delete-dialog"
import type { QuestionGroupRow } from "@/schemas/question-group-schema"

export const groupColumns: ColumnDef<QuestionGroupRow>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Group" />
        ),
        cell: ({ row }) => {
            return (
                <Link
                    href={`/admin/questions-groups/${row.original.id}/questions`}
                    className="max-w-[280px] truncate font-medium text-primary hover:underline"
                >
                    {row.getValue("title")}
                </Link>
            )
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Description" />
        ),
        cell: ({ row }) => {
            const description: string | null = row.getValue("description")
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[320px] truncate text-muted-foreground">
                        {description ? description : "—"}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "questionCount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Questions" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <Badge variant="outline" className="gap-1.5">
                        <FolderOpen className="size-3.5" />
                        {row.getValue("questionCount")}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Created" />
        ),
        cell: ({ row }) => {
            const createdAt: string = row.getValue("createdAt")
            return (
                <div className="text-muted-foreground">
                    {new Date(createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </div>
            )
        },
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Actions" />
        ),
        cell: ({ row }) => {
            const group = row.original
            if (!group.id) {
                return null
            }

            return (
                <div className="flex items-center">
                    <span className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-primary bg-transparent hover:bg-purple-700/10"
                            aria-label={`Open group ${group.title}`}
                            asChild
                        >
                            <Link
                                href={`/admin/questions-groups/${group.id}/questions`}
                            >
                                <Eye className="size-5 text-primary" />
                            </Link>
                        </Button>
                        <GroupFormDialog
                            mode="edit"
                            group={{
                                id: group.id,
                                title: group.title,
                                description: group.description,
                            }}
                        />
                        <GroupDeleteDialog
                            groupId={group.id}
                            groupTitle={group.title}
                            questionCount={group.questionCount}
                        />
                    </span>
                </div>
            )
        },
        enableSorting: false,
    },
]

interface GroupsDataTableProps {
    data: QuestionGroupRow[]
}

/**
 * Question-groups list table on /admin/questions-groups.
 * Follows the shared data-table pattern used across the admin app
 * (search toolbar, view options, sortable headers, pagination).
 */
export function GroupsDataTable({ data }: GroupsDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns: groupColumns,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Input
                        placeholder="Filter Groups"
                        value={
                            (table.getColumn("title")?.getFilterValue() as string) ??
                            ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("title")
                                ?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 lg:px-3"
                        >
                            Reset
                            <Cross2Icon className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
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
                                <TableRow key={row.id}>
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
                                    colSpan={groupColumns.length}
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
        </div>
    )
}

export default GroupsDataTable
