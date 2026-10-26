import { z } from "zod"
import React from 'react'
import BackBtn from '@/components/backbtn'
import { getAllStudents } from '@/data/students'
import { getCourseById } from '@/data/courses'
import { StudentTableSchema } from '@/schemas/student-schema'
import { CourseStudentAddDataTable } from "@/components/course-student/course-student-add-table/csa-data-table"
import { columns } from "@/components/course-student/course-student-add-table/csa-columns"
import { getstudentsbycourseid } from "@/actions/usercourse"

async function fetchStudents(cid: string) {
    const students = await getstudentsbycourseid(cid)
    // console.log("students: ",students)
    const sids = students?.map(student => student.id); 
    // console.log("sids:", sids);
    return sids;
}

async function fetchAllStudents() {
    const students = await getAllStudents()
    return z.array(StudentTableSchema).parse(students)
}
const CourseStudentsAdd = async ({ params }: { params: Promise<{ cid: string}> }) => {
    const { cid } = await params
    // const courseId = parseInt(cid, 10);
    const coursestudents = await fetchStudents(cid)
    const allstudents = await fetchAllStudents()
    const course = await getCourseById(cid)
    if (allstudents === null) {
        return <p>No Students Available.</p>;
    }

    const filterStudents = allstudents.filter(student => !coursestudents?.includes(student.id));
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {course?.title}
                        </h2>
                        <p className="text-muted-foreground">
                            Assign Students
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <CourseStudentAddDataTable data={filterStudents} columns={columns} cid={cid} />
            </div>
        </>
    )
}

export default CourseStudentsAdd