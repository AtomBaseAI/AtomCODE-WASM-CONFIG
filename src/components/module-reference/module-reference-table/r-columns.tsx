"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { ModuleReferenceTableType } from "@/schemas/references-schema";
import DeleteReference from "@/components/module-reference/module-reference-table/r-delete";
import EditReference from "@/components/module-reference/module-reference-table/r-edit";
import ViewReference from "./r-view";

export const columns: ColumnDef<ModuleReferenceTableType>[] = [


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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Type" />
    ),
    cell: ({ row }) => {
      const linktype: string = row.getValue("type")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {linktype === 'yt' ? 'YouTube' : linktype.toLocaleUpperCase()}
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Actions" />
    ),
    cell: ({ row }) => {
      const id: string = row.getValue('id')
      const referencedata: any = {
        id: row.getValue('id'),
        title: row.getValue('title'),
        link: row.getValue('link'),
        type: row.getValue('type'),
      }
      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            <ViewReference link={row.getValue("link")} />
            <EditReference reference={referencedata} />
            <DeleteReference rid={id} />
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
