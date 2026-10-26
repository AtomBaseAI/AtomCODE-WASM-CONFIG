import { z } from "zod"
import React from 'react'
import BackBtn from '@/components/backbtn'
import { getCourseById } from '@/data/courses'

import { getstaffsbycourseid } from "@/actions/staffcourse"
import { getAllStaffs } from "@/data/staffs"
import { StaffTableSchema } from "@/schemas/staff-schema"
import { CourseStaffAddDataTable } from "@/components/course-staff/course-staff-add-table/cstfa-data-table"
import { columns } from "@/components/course-staff/course-staff-add-table/cstfa-columns"

async function fetchStaffs(cid: string) {
    const staffs = await getstaffsbycourseid(cid)
    const sids = staffs?.map(staff => staff.id);
    return sids;
}

async function fetchAllStaffs() {
    const staffs = await getAllStaffs()
    return z.array(StaffTableSchema).parse(staffs)
}
const CourseStaffsAdd = async ({ params }: { params: Promise<{ cid: string}> }) => {
    const { cid } = await params
    const coursestaffs = await fetchStaffs(cid)
    const allstaffs = await fetchAllStaffs()
    const course = await getCourseById(cid)
    if (allstaffs === null) {
        return <p>No Staffs Available.</p>;
    }

    const filterStaffs = allstaffs.filter(staff => !coursestaffs?.includes(staff.id));
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {course?.title}
                        </h2>
                        <p className="text-muted-foreground">
                            Assign Staffs
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <CourseStaffAddDataTable data={filterStaffs} columns={columns} cid={cid} />
            </div>
        </>
    )
}

export default CourseStaffsAdd