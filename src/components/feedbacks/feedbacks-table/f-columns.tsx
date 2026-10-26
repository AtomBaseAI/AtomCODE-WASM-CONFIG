"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { FeedbackTableType } from "@/schemas/feedback-schema"
import { formatDate } from '@/lib/utils';
import DeleteFeedback from "@/components/feedbacks/feedbacks-table/f-delete";
import EditFeedback from "./f-edit";

export const columns: ColumnDef<FeedbackTableType>[] = [


  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Title" />
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
    accessorKey: "link",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Link" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium line-clamp-1">
            {row.getValue("link")}
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

      const fdate = new Date(row.getValue("date"))
      const formattedDate = formatDate(fdate);
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {formattedDate}
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
      const id: string = row.getValue('id')
      const feedbackdata: any = {
        id: row.getValue('id'),
        title: row.getValue('title'),
        link: row.getValue('link'),
        date: row.getValue('date'),
      }
      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            <EditFeedback feedback={feedbackdata} />
            <DeleteFeedback fid={id} />
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
