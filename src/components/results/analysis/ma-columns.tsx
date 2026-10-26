"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { formatDate } from '@/lib/utils';
import { ModuleAnalysisSchemaType } from "@/schemas/result-analysis-schema";
import MAView from "@/components/results/analysis/ma-view";

export const columns: ColumnDef<ModuleAnalysisSchemaType>[] = [

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
    accessorKey: "studentsEnrolled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Total Students" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("studentsEnrolled")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "studentsCompleted",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Completed" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("studentsCompleted")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "studentsInProgress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="In Progress" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("studentsInProgress")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "studentsRetake",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Retake" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("studentsRetake")}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: "studentsNotStarted",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Not Started" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {row.getValue("studentsNotStarted")}
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
      if (!mid) {
        return null
      }

      const scx: number = row.getValue("studentsEnrolled")

      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            {scx >= 0 && <MAView mdata={mdata} />}
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
