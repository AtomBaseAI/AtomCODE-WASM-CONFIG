"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-tables/data-table-view-options"


import { difficulties, languages } from "@/components/question/question-table/q-config-data"
import { GROUP_UNGROUPED_VALUE } from "@/components/question/question-table/q-columns"

import { DataTableFacetedFilter } from "@/components/data-tables/data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function QDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Group filter options are derived from the data itself so newly created
  // groups appear without a code change. Ungrouped questions get an explicit
  // "Not in a group" entry via the GROUP_UNGROUPED_VALUE sentinel.
  const groupsColumn = table.getColumn("groupTitle")
  const groupOptions = groupsColumn
    ? [
        ...Array.from(groupsColumn.getFacetedUniqueValues().keys())
          .filter((v): v is string => typeof v === "string" && v !== "")
          .sort()
          .map((v) => ({ label: v, value: v })),
        { label: "Not in a group", value: GROUP_UNGROUPED_VALUE },
      ]
    : []

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter Questions"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
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
        {table.getColumn("groupTitle") && groupOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("groupTitle")}
            title="Groups"
            options={groupOptions}
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
  )
}
