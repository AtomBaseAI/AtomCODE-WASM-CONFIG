"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { QuestionTableType } from "@/schemas/question-schema"



// export const columns: ColumnDef<ModuleQuestionTableQuestionType>[] = [
export const columns: ColumnDef<QuestionTableType>[] = [
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
    accessorKey: "maxscore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Maximum Marks" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("maxscore")}
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
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("difficulty")}
          </span>
        </div>
      )
    },
  },

  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
