"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { MCQTableType } from "@/schemas/mcq-schema"
import MCPreview from "@/components/mcq/mcq-table/preview/mc-preview"


export const columns: ColumnDef<MCQTableType>[] = [

  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Question" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "CorrectOption",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="CorrectOption" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("CorrectOption")}
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
      const qid: string = row.getValue("id")
      const data: any = row.original
      // console.log(data)
      if (!qid) {
        return null
      }

      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            {/* <DeleteMCQ mcqId={qid} /> */}
            <MCPreview question={data} />
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
