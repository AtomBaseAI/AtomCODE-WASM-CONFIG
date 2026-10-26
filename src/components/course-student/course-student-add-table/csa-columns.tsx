"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { StudentTableType } from "@/schemas/student-schema"
import { bathces, departments, sections } from "@/components/data-tables/data-table-config-data"


export const columns: ColumnDef<StudentTableType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "rollnumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Rollnumber" />
    ),
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("rollnumber")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Name" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium line-clamp-1">
            {row.getValue("name")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("email")}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Batch" />
    ),
    cell: ({ row }) => {
      const batch = bathces.find(
        (batch) => batch.value === row.getValue("batch")
      )

      if (!batch) {
        return null
      }

      return (
        <div className="flex items-center">
          {batch.icon && (
            <batch.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{batch.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Department" />
    ),
    cell: ({ row }) => {
      const department = departments.find(
        (department) => department.value === row.getValue("department")
      )

      if (!department) {
        return null
      }

      return (
        <div className="flex w-[130px] items-center">
          {department.icon && (
            <department.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{department.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Section" />
    ),
    cell: ({ row }) => {
      const section = sections.find(
        (section) => section.value === row.getValue("section")
      )

      if (!section) {
        return null
      }

      return (
        <div className="flex w-[130px] items-center">
          {section.icon && (
            <section.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{section.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
