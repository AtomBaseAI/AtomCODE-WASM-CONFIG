"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { CourseTableType } from "@/schemas/course-schema"
import { formatDate } from '@/lib/utils';
import DeleteCourse from "@/components/course/course-table/c-delete"
import CEdit from "@/components/course/course-table/c-edit"
import CModules from "@/components/course/course-table/c-modules"
import CStudents from "@/components/course/course-table/c-students"
import CFeedbacks from "@/components/course/course-table/c-feedbacks";
import CStaffs from "@/components/course/course-table/c-staffs";
import CAssessments from "@/components/course/course-table/c-assessments";
export const columns: ColumnDef<CourseTableType>[] = [

  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Course" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium line-clamp-1">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "startdate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Start Date" />
    ),
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("startdate"))
      const formattedStartDate = formatDate(startDate);
      return (
        <div className="flex space-x-2">
          <span className="max-w-[80px] truncate font-medium ">
            {formattedStartDate}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "enddate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="End Date" />
    ),
    cell: ({ row }) => {
      const endDate = new Date(row.getValue("enddate"))
      const formattedEndtDate = formatDate(endDate);
      return (
        <div className="flex space-x-2">
          <span className="max-w-[80px] truncate font-medium ">
            {formattedEndtDate}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Language" />
    ),
    cell: ({ row }) => {
      const lang: string = row.getValue("language")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[60px] truncate font-medium ">
            {lang.toUpperCase()}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "modulescount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Modules" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20px] truncate font-medium ">
            {row.getValue("modulescount")}
          </span>
        </div>
      )
    },
  },
  // {
  //   accessorKey: "assessmentscount",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} name="Assessments" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="max-w-[20px] truncate font-medium ">
  //           {row.getValue("assessmentscount")}
  //         </span>
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Actions" />
    ),
    cell: ({ row }) => {
      const modulecount: number = row.getValue("modulescount")
      const cid: string = row.getValue("id")
      if (!cid) {
        return null
      }

      return (
        <div className="flex items-center w-fit">
          <span className="flex gap-2">
            <CModules cid={cid} />
            <CAssessments cid={cid}/>
            <CStudents cid={cid} />
            <CStaffs cid={cid} />
            <CFeedbacks cid={cid} />
            <CEdit cid={cid} />
            {modulecount <= 0 && <DeleteCourse cid={cid} />}
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
