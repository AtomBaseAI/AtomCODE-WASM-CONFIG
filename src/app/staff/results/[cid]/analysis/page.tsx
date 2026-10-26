import { z } from "zod"

import BackBtn from "@/components/backbtn"
import { getmoduleresults } from "@/data/analysis"
import { ModuleAnalysisSchema } from "@/schemas/result-analysis-schema"
import { getCourseById } from "@/data/courses"
import { ModuleAnalysisDataTable } from "@/components/results/analysis/ma-data-table"
import { columns } from "@/components/staff/results/analysis/ma-columns"

async function fetchModulesdata(cid: string) {
  const modules = await getmoduleresults(cid)
  return z.array(ModuleAnalysisSchema).parse(modules)
}

const CourseAnalysis = async ({ params }: { params: Promise<{ cid }> }) => {
  const { cid } = await params
  // const courseId = parseInt(cid, 10);
  const modules = await fetchModulesdata(cid)
  const course = await getCourseById(cid)
  const courseData = {
    cid: course?.id || '',
    lang: course?.language || ''
  }
  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{course?.title}</h2>
            <p className="text-muted-foreground">
              All Modules : {modules.length}
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <BackBtn />
          </div>
        </div>
        <ModuleAnalysisDataTable data={modules} columns={columns} />
      </div>
    </>
  )
}

export default CourseAnalysis


