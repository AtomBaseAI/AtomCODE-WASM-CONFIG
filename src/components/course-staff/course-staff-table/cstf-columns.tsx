"use client"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { departments } from "@/components/data-tables/data-table-config-data"
import { StaffTableType } from "@/schemas/staff-schema"
import StaffDeleteHelper from "@/components/course-staff/course-staff-table/cstf-deletehelper"


export const columns: ColumnDef<StaffTableType>[] = [
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
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Actions" />
    ),
    cell: ({ row }) => {
      const id: string = row.getValue("id")
      const name: string = row.getValue("name")
      if (!id) {
        return null
      }

      return (
        <div className="flex items-center">
          <span className="flex gap-2">
            {/* <DeleteCourseStudent uid={id} /> */}
            <StaffDeleteHelper uid={id} />
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
