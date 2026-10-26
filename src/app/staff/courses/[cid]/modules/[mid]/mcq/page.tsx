import { getModuleById } from '@/data/modules'
import React from 'react'
import BackBtn from '@/components/backbtn'
import { getModuleMCQsByModuleId } from '@/data/mcq'
import { MCQDataTable } from '@/components/mcq/mcq-table/mc-data-table'
import { columns } from '@/components/staff/mcq/mcq-table/mc-columns'

async function fetchModule(mid: string) {
    const modulez = await getModuleById(mid)
    return modulez
}
async function fetchModuleMCQs(mid: string) {
    const modulex = await getModuleMCQsByModuleId(mid)
    return modulex
}

const ViewModule = async ({ params }: { params: Promise<{ cid, mid }> }) => {
    const { cid, mid } = await params
    // const moduleId = parseInt(mid, 10);
    const modulez = await fetchModule(mid)
    const modulex = await fetchModuleMCQs(mid)

    const mcqData = modulex?.map(mcq => ({
        ...mcq,
        referenceimg: mcq.referenceimg || undefined,
        codesnippet: mcq.codesnippet || undefined,
        topic: mcq.topic || undefined,
        subtopic: mcq.subtopic || undefined
    })) || [];
    // console.log(mcqData)
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {modulez?.title}
                        </h2>
                        <p className="text-muted-foreground">
                            Module MCQs : {modulex?.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <MCQDataTable data={mcqData} columns={columns} />
            </div>
        </>
    )
}

export default ViewModule
