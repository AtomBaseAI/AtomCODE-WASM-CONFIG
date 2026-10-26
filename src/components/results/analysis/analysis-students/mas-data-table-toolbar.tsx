"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-tables/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/data-tables/data-table-faceted-filter"
import { bathces, departments, modulefilters, sections } from "@/components/data-tables/data-table-config-data"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function MASDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter by Rollnumber"
          value={(table.getColumn("rollnumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("rollnumber")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("batch") && (
          <DataTableFacetedFilter
            column={table.getColumn("batch")}
            title="Batch"
            options={bathces}
          />
        )}
        {table.getColumn("department") && (
          <DataTableFacetedFilter
            column={table.getColumn("department")}
            title="Department"
            options={departments}
          />
        )}
        {table.getColumn("section") && (
          <DataTableFacetedFilter
            column={table.getColumn("section")}
            title="Section"
            options={sections}
          />
        )}

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={modulefilters}
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
