
import { z } from "zod"

import { columns } from "@/components/student/student-table/s-columns"
import { StudentDataTable } from "@/components/student/student-table/s-data-table"

import { getAllStudents } from "@/data/students"
import AddStudent from "@/components/student/student-add-form"
import { StudentTableSchema } from "@/schemas/student-schema"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"
import Link from "next/link"

async function fetchStudents() {
  const students = await getAllStudents()
  return z.array(StudentTableSchema).parse(students)
}

export default async function StudentsData() {
  const students = await fetchStudents()

  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Students</h2>
            <p className="text-muted-foreground">
              All Students
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <AddStudent />
            <Link href='/admin/students/import'>
              <Button>
                <UploadCloud className="mr-2" />
                Bulk Upload
              </Button>
            </Link>
          </div>
        </div>
        <StudentDataTable data={students} columns={columns} />
      </div>
    </>
  )
}