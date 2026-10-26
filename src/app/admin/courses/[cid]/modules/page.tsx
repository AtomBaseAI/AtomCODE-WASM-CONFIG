import { z } from "zod"
import { getAllModulesByCourseId } from "@/data/modules"
import { getCourseById } from "@/data/courses"
import { ModuleTableSchema } from "@/schemas/module-schema"
import { ModuleDataTable } from "@/components/module/module-table/m-data-table"
import { columns } from "@/components/module/module-table/m-columns"
import AddModule from "@/components/module/module-add-form"
import BackBtn from "@/components/backbtn"

async function fetchModules(cid: string) {
    const modules = await getAllModulesByCourseId(cid)
    return z.array(ModuleTableSchema).parse(modules)
}
export default async function ModulesData({ params }: { params: Promise<{ cid: string}> }) {
    const { cid } = await params
    const modules = await fetchModules(cid)
    const course = await getCourseById(cid)
    const courseData = {
        cid: course?.id || '',
        lang: course?.language || ''
    }
    // console.log(modules)
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
                        <AddModule cdata={courseData} />
                        <BackBtn />
                    </div>
                </div>
                <ModuleDataTable data={modules} columns={columns} />
            </div>
        </>
    )
}