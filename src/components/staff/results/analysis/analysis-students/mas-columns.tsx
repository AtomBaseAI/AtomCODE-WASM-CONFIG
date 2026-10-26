"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { format } from 'date-fns';
import { ResultAnalysisStudentType } from "@/schemas/result-analysis-schema";
import MASView from "@/components/staff/results/analysis/analysis-students/mas-view";
import { bathces, departments, modulefilters, sections } from "@/components/data-tables/data-table-config-data";
import { LucideBarChartHorizontalBig } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<ResultAnalysisStudentType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Name" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[120px] truncate font-medium line-clamp-2">
            {row.getValue("name")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Rollnumber" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[80px] truncate font-medium ">
            {row.getValue("rollnumber")}
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
        <div className="flex max-w-[100px]  items-center">
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
        <div className="flex max-w-[100px] items-center">
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
        <div className="flex max-w-[80px] items-center">
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


  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Status" />
    ),
    cell: ({ row }) => {
      const status = modulefilters.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex max-w-[110px] items-center justify-start h-full">
          <span className={`w-full flex flex-row h-full justify-center rounded-md items-center ${status.bg} text-white`}>
            {status.icon && (
              <status.icon className="mr-2 h-4 w-4" />
            )}
            <span>{status.label}</span>
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "mcqScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="MCQ Score" />
    ),
    cell: ({ row }) => {
      const mcqscore = row.getValue("mcqScore")
      const maxmcqscore = row.original.maxmcqscore;
      const mcqstatus = row.original.mcqstatus;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[110px] truncate font-medium ">
            {mcqstatus === 'submitted' ?
              (
                <>
                  {`${mcqscore} / ${maxmcqscore}`}
                </>
              ) : (
                <p className="bg-red-500 rounded-md text-white">
                  Not Submitted
                </p>
              )
            }
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "codeScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Code Score" />
    ),
    cell: ({ row }) => {
      const codescore = row.getValue("codeScore")
      const maxcodescore = row.original.maxcodescore;
      const codestatus = row.original.questionstatus;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[110px] truncate font-medium ">

            {codestatus === 'submitted' ?
              (
                <>
                  {`${codescore} / ${maxcodescore}`}
                </>
              ) : codestatus === 'retake' ? (
                <p className="bg-orange-500 rounded-md text-white">
                  {`${codescore} / ${maxcodescore}`}
                </p>
              ) : (
                <p className="bg-red-500 rounded-md text-white">
                  Not Submitted
                </p>
              )
            }
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "totalScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Total Score" />
    ),
    cell: ({ row }) => {
      const totalscore = row.getValue("totalScore")
      const maxscore = row.original.maxScore;
      const codestatus = row.original.questionstatus;
      const mcqstatus = row.original.mcqstatus;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {(mcqstatus !== 'not submitted' || codestatus !== 'not submitted') ? (
              <>
                {`${totalscore} / ${maxscore}`}
              </>
            ) : (
              <>
                N/A
              </>
            )}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Time" />
    ),
    cell: ({ row }) => {
      const time = row.getValue("time") as number | undefined;
      const codestatus = row.original.questionstatus;
      const mcqstatus = row.original.mcqstatus;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[50px] truncate font-medium ">
            {(mcqstatus !== 'not submitted' || codestatus !== 'not submitted') ? (
              <>
                {time ? `${time} s` : "N/A"}
              </>
            ) : (
              <>
                N/A
              </>
            )}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "rollnumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Actions" />
    ),
    cell: ({ row }) => {
      const mid: string = row.original.mid
      const cid: string = row.original.cid
      const uid: string = row.original.userid
      const mdata = {
        mid: mid,
        cid: cid,
        uid: uid
      }
      if (!mid) {
        return null
      }

      const codestatus = row.original.questionstatus;
      const mcqstatus = row.original.mcqstatus;
      return (
        <div className="flex items-center">
          {(mcqstatus !== 'not submitted' || codestatus !== 'not submitted') ? (
            <span className="flex gap-2">
              <MASView mdata={mdata} />
            </span>
          ) : (
            <>
              <Button variant='outline' size='icon' className="border-red-500 bg-transparent hover:bg-red-500/10 cursor-not-allowed" disabled>
                <LucideBarChartHorizontalBig className="size-5 bg-transparent text-red-500" />
              </Button>
            </>
          )

          }

        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
]
