"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Cross2Icon } from "@radix-ui/react-icons"
import { LoaderIcon, Trash } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { DataTableFacetedFilter } from "@/components/data-tables/data-table-faceted-filter"
import { difficulties, languages } from "@/components/question/question-table/q-config-data"
import QEdit from "@/components/question/question-table/q-edit"
import type { GroupQuestionRow } from "@/schemas/question-group-schema"

/** Remove-from-group action, styled like the shared table action buttons. */
const RemoveFromGroupButton = ({
    groupId,
    qid,
    title,
}: {
    groupId: string
    qid: string
    title: string
}) => {
    const router = useRouter()
    const [isRemoving, setIsRemoving] = React.useState(false)

    const handleRemove = () => {
        setIsRemoving(true)
        fetch(
            `/api/question-groups/${groupId}/questions?questionId=${qid}`,
            { method: "DELETE" }
        )
            .then(async (res) => {
                const data = await res.json().catch(() => null)
                if (!res.ok) {
                    toast.error(data?.error ?? "Something went wrong!")
                    return
                }
                toast.success(`"${title}" removed from the group`)
                router.refresh()
            })
            .catch(() => toast.error("Network error — please try again."))
            .finally(() => setIsRemoving(false))
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="border-destructive bg-transparent hover:bg-red-400/20"
            aria-label={`Remove ${title} from group`}
            onClick={handleRemove}
            disabled={isRemoving}
        >
            {isRemoving ? (
                <LoaderIcon className="size-5 animate-spin text-destructive" />
            ) : (
                <Trash className="size-5 bg-transparent text-destructive" />
            )}
        </Button>
    )
}

/** Columns for the questions that live inside a question group. */
export const getGroupQuestionColumns = (
    groupId: string
): ColumnDef<GroupQuestionRow>[] => [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Question" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[350px] truncate font-medium ">
                        {row.getValue("title")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "lang",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Language" />
        ),
        cell: ({ row }) => {
            const language = languages.find(
                (language) => language.value === row.getValue("lang")
            )

            if (!language) {
                return null
            }

            return (
                <div className="flex items-center">
                    {language.icon && (
                        <language.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{language.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "topic",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Topic" />
        ),
        cell: ({ row }) => {
            const topic: string | null = row.getValue("topic")
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[200px] truncate font-medium ">
                        {topic ? topic : "Not Available"}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "subtopic",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Sub Topic" />
        ),
        cell: ({ row }) => {
            const subtopic: string | null = row.getValue("subtopic")
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[200px] truncate font-medium ">
                        {subtopic ? subtopic : "Not Available"}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "difficulty",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Difficulty" />
        ),
        cell: ({ row }) => {
            const difficulty = difficulties.find(
                (difficulty) => difficulty.value === row.getValue("difficulty")
            )

            if (!difficulty) {
                return null
            }

            return (
                <div className="flex w-[130px] items-center">
                    {difficulty.icon && (
                        <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{difficulty.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} name="Actions" />
        ),
        cell: ({ row }) => {
            const qst = row.original
            if (!qst.id) {
                return null
            }

            return (
                <div className="flex items-center">
                    <span className="flex gap-2">
                        <QEdit qid={qst.id} />
                        <RemoveFromGroupButton
                            groupId={groupId}
                            qid={qst.id}
                            title={qst.title}
                        />
                    </span>
                </div>
            )
        },
        enableSorting: false,
    },
]

interface GroupQuestionsDataTableProps {
    groupId: string
    data: GroupQuestionRow[]
}

/**
 * Questions that live inside a question group, on
 * /admin/questions-groups/[gid]/questions. Follows the shared data-table
 * pattern used across the admin app (faceted filters, view options,
 * sortable headers, pagination).
 */
export function GroupQuestionsDataTable({
    groupId,
    data,
}: GroupQuestionsDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([])

    const columns = React.useMemo(
        () => getGroupQuestionColumns(groupId),
        [groupId]
    )

    const table = useReactTable({
        data,
        columns,
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
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Input
                        placeholder="Filter Questions"
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
                    {table.getColumn("lang") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("lang")}
                            title="Languages"
                            options={languages}
                        />
                    )}
                    {table.getColumn("difficulty") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("difficulty")}
                            title="Difficulty"
                            options={difficulties}
                        />
                    )}
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
                                    colSpan={columns.length}
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

export default GroupQuestionsDataTable
