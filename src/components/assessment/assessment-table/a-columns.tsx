"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { formatDate } from '@/lib/utils';


import { AssessmentTableType } from "@/schemas/assessment-schema";
import DeleteAssessment from "./a-delete";
import ACODEView from "@/components/assessment/assessment-table/a-codeview";
import AMCQView from "@/components/assessment/assessment-table/a-mcqview";
import AEdit from "@/components/assessment/assessment-table/a-edit";

export const columns: ColumnDef<AssessmentTableType>[] = [

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
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Date" />
    ),
    cell: ({ row }) => {
      const moduleDate = new Date(row.getValue("date"))
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
    accessorKey: "codecount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Code" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("codecount")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("codecount")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "mcqcount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="MCQ" />
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
    accessorKey: "starttime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Start" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("starttime")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("starttime")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "maxtime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Duration" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("maxtime")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("maxtime")}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: "accesskey",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Key" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("accesskey")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[70px] truncate font-medium ">
            {row.getValue("accesskey")}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: "tabswitches",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="T/S" />
    ),
    cell: ({ row }) => {
      const qn: any = row.getValue("tabswitches")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("tabswitches")}
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
      const aid: string = row.getValue("id")
      const cid: string = row.original.courseId
      const adata = {
        aid: aid,
        cid: cid
      }
      const qn: number = row.getValue("codecount")
      const mcqn: number = row.getValue("mcqcount")

      if (!aid) {
        return null
      }

      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            <ACODEView adata={adata} />
            <AMCQView adata={adata} />
            <AEdit adata={adata} />
            {qn <= 0 && mcqn <= 0 && <DeleteAssessment aid={aid} />}
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
