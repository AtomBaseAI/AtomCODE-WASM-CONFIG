"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-tables/data-table-view-options"
import { useState } from "react"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"
import { DataTableFacetedFilter } from "@/components/data-tables/data-table-faceted-filter"
import { departments } from "@/components/data-tables/data-table-config-data"
import { addcoursestaffs } from "@/actions/staffcourse"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  cid: string
}

export function CSTFADataTableToolbar<TData>({
  table,
  cid
}: DataTableToolbarProps<TData>) {

  const [loading, setLoading] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowCount = table.getSelectedRowModel().rows.length;

  const getSelectedColIds = async () => {
    setLoading(true);
    try {
      const idfielddata = table.getGroupedSelectedRowModel().rowsById
      const sids = Object.values(idfielddata).map(item => (item.original as { id: string }).id);
      // console.log(sids)
      const result = await addcoursestaffs(cid, sids);
      if (result.success) {
        table.resetRowSelection();
        // console.log(result.success);
        toast.success(result.success)
      }
    } catch (error) {
      console.error("Error adding Staffs to course:", error);
      toast.error(`Error ${error}`)
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter Staff ID"
          value={(table.getColumn("staffnumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("staffnumber")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />


        {table.getColumn("department") && (
          <DataTableFacetedFilter
            column={table.getColumn("department")}
            title="Department"
            options={departments}
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
        <Button
          className="bg-green-500 hover:bg-green-600"
          onClick={getSelectedColIds}
          disabled={loading || selectedRowCount === 0}
        >
          {loading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            "Assign"
          )}
        </Button>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
