"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-tables/data-table-view-options"
// import { addmodulequestions } from "@/actions/module"
import { useState } from "react"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"
import { addassessmentquestions } from "@/actions/assessment"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  aid: string
}

export function AQADataTableToolbar<TData>({
  table,
  aid
}: DataTableToolbarProps<TData>) {
  const [loading, setLoading] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowCount = table.getSelectedRowModel().rows.length;
  // const isFiltered = table.getState().columnFilters.length > 0

  // const getSelectedColIds = async () => {
  //   try {
  //     const idfielddata = table.getGroupedSelectedRowModel().rowsById
  //     const qids = Object.values(idfielddata).map(item => (item.original as { id: string }).id);
  //     const result = await addmodulequestions(mid, qids);
  //     if (result.success) {
  //       table.resetRowSelection(); 
  //       console.log(result.success);
  //     }
  //   } catch (error) {
  //     console.error("Error adding questions to module:", error);
  //   }
  // }
  const getSelectedColIds = async () => {
    setLoading(true);
    try {
      const idfielddata = table.getGroupedSelectedRowModel().rowsById;
      const qids = Object.values(idfielddata).map(item => (item.original as { id: string }).id);
      const result = await addassessmentquestions(aid, qids);
      if (result.success) {
        table.resetRowSelection();
        // console.log(result.success);
        toast.success(result.success)
      }
    } catch (error) {
      console.error("Error adding questions to module:", error);
      toast.error(`Error ${error}`)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter Active Questions"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
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
        <Button
          className="bg-green-500 hover:bg-green-600"
          onClick={getSelectedColIds}
          disabled={loading || selectedRowCount === 0}
        >
          {loading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            "Add"
          )}
        </Button>

      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
