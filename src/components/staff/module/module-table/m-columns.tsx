"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { formatDate } from '@/lib/utils';

import { ModuleTableType } from "@/schemas/module-schema";
import MCODEView from "@/components/staff/module/module-table/m-codeview";
import MMCQView from "@/components/staff/module/module-table/m-mcqview";
import MReferences from "@/components/staff/module/module-table/m-references";

export const columns: ColumnDef<ModuleTableType>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Module" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="w-[200px] truncate font-medium ">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "moduledate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Date" />
    ),
    cell: ({ row }) => {
      const moduleDate = new Date(row.getValue("moduledate"))
      const formattedModuletDate = formatDate(moduleDate);

      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium ">
            {formattedModuletDate}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "modulestatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium ">
            {row.getValue("modulestatus")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "maxscore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Max Score" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[80px] truncate font-medium ">
            {row.getValue("maxscore")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "questionscount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Questions" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("questionscount")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("questionscount")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "mcqcount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="MCQ's" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("mcqcount")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("mcqcount")}
          </span>
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
      const mid: string = row.getValue("id")
      const cid: string = row.original.courseId
      const mdata = {
        mid: mid,
        cid: cid
      }
      const qn: number = row.getValue("questionscount")
      const mcqn: number = row.getValue("mcqcount")

      if (!mid) {
        return null
      }

      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            <MCODEView mdata={mdata} />
            <MMCQView mdata={mdata} />
            <MReferences mdata={mdata} />
            {/* <MEdit mdata={mdata} />
            {qn <= 0 && mcqn <= 0 && <DeleteModule mid={mid} />} */}
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
