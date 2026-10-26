import BackBtn from "@/components/backbtn"
import { columns } from "@/components/staff/results/analysis/analysis-students/mas-columns"
import { ResultAnalysisStudentsDataTable } from "@/components/results/analysis/analysis-students/mas-data-table"
import { getStudentsDataByCourseIdByModule } from "@/data/analysis"
import { getCourseModuleTitlesByModuleId } from "@/data/modules"
import { ResultAnalysisStudentSchema } from "@/schemas/result-analysis-schema"
import { z } from "zod"

async function fetchResultAnalysisStudents(cid: string, mid: string) {
    const resultdata = await getStudentsDataByCourseIdByModule(cid, mid)
    // console.log(resultdata)
    return z.array(ResultAnalysisStudentSchema).parse(resultdata)
}
const ResultAnalysisStudents = async ({ params }: { params: Promise<{ cid, mid }> }) => {
    const { cid, mid } = await params
    // const moduleId = parseInt(mid, 10);
    // const courseId = parseInt(cid, 10);
    const ResultAnalysisStudentsData = await fetchResultAnalysisStudents(cid, mid)
    // console.log(ResultAnalysisStudentsData)
    const titles = await getCourseModuleTitlesByModuleId(mid);
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {titles?.moduleTitle}
                        </h2>
                        <p className="text-muted-foreground">
                            {titles?.courseTitle}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <ResultAnalysisStudentsDataTable data={ResultAnalysisStudentsData} columns={columns} />
            </div>
        </>
    )
}

export default ResultAnalysisStudents