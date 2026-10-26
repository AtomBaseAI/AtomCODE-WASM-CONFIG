"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { departments } from "@/components/data-tables/data-table-config-data"
import { StaffTableType } from "@/schemas/staff-schema"


export const columns: ColumnDef<StaffTableType>[] = [
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
    accessorKey: "staffnumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Staff ID" />
    ),
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("staffnumber")}</div>,
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
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue("phone")}
          </span>
        </div>
      )
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


  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
