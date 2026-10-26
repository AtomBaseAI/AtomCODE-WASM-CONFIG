import { z } from "zod"
import { CourseTableSchema } from "@/schemas/course-schema"
import { getAllStaffCourses } from "@/data/staff/courses"
import { CourseDataTable } from "@/components/course/course-table/c-data-table"
import { columns } from "@/components/staff/course/course-table/c-columns"
import { auth } from "@/auth"

const getSession = async () => {
  const session = await auth();
  return session;
}

async function fetchCourses(staffID: string) {
  const courses = await getAllStaffCourses(staffID)
  return z.array(CourseTableSchema).parse(courses)
}


export default async function CoursesData() {

  const staffsession = await getSession();
  if (staffsession?.user?.id === undefined) {
    return null;
  }
  const staffID = staffsession?.user.id;
  const courses = await fetchCourses(staffID)
  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
            <p className="text-muted-foreground">
              All Courses : {courses.length}
            </p>
          </div>
        </div>
        <CourseDataTable data={courses} columns={columns} />
      </div>
    </>
  )
}