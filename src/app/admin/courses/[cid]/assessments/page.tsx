import { z } from "zod"
import { getCourseById } from "@/data/courses"


import BackBtn from "@/components/backbtn"
import { AssessmentTableSchema } from "@/schemas/assessment-schema"
import { getAllAssessmentsByCourseId } from "@/data/assessments"
import AddAssessment from "@/components/assessment/assessment-add-form"
import { AssessmentDataTable } from "@/components/assessment/assessment-table/a-data-table"
import { columns } from "@/components/assessment/assessment-table/a-columns"

async function fetchAssessments(cid: string) {
    const assessments = await getAllAssessmentsByCourseId(cid)
    return z.array(AssessmentTableSchema).parse(assessments)
}
export default async function AssessmentsData({ params }: { params: Promise<{ cid: string}> }) {
    const { cid } = await params
    const assessments = await fetchAssessments(cid)
    const course = await getCourseById(cid)
    const courseData = {
        cid: course?.id || '',
        lang: course?.language || ''
    }
    // console.log(assessments)
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{course?.title}</h2>
                        <p className="text-muted-foreground">
                            All Assessments : {assessments.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <AddAssessment cdata={courseData} />
                        <BackBtn />
                    </div>
                </div>
                <AssessmentDataTable data={assessments} columns={columns} />
            </div>
        </>
    )
}