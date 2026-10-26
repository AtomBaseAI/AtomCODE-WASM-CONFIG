import { z } from "zod"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { ShipWheel, Users } from "lucide-react"
import BackBtn from '@/components/backbtn'
import { getCourseById } from '@/data/courses'
import { getstaffsbycourseid } from "@/actions/staffcourse"
import { StaffTableSchema } from "@/schemas/staff-schema"
import { CourseStaffDataTable } from "@/components/course-staff/course-staff-table/cstf-data-table"
import { columns } from "@/components/course-staff/course-staff-table/cstf-columns"

async function fetchStaffs(cid: string) {
    const staffs = await getstaffsbycourseid(cid)
    if (!staffs) {
        return [];
    }
    return z.array(StaffTableSchema).parse(staffs);
}

const CourseStaffs = async ({ params }: { params: Promise<{ cid: string}> }) => {
    const { cid } = await params
    // const courseId = parseInt(cid, 10);
    const staffsdata = await fetchStaffs(cid)
    const course = await getCourseById(cid)
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {course?.title}
                        </h2>
                        <p className="text-muted-foreground">
                            Course Staffs : {staffsdata?.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <Link href={`/admin/courses/${cid}/staffs/add`}>
                            <Button className="bg-green-500 hover:bg-green-700 text-white"> <ShipWheel className="mr-2" /> Assign Staffs</Button>
                        </Link>
                        <BackBtn />
                    </div>
                </div>
                <CourseStaffDataTable data={staffsdata} columns={columns} />
            </div>
        </>
    )
}

export default CourseStaffs