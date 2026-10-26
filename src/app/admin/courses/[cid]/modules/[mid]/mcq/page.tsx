import { getModuleById } from '@/data/modules'
import React from 'react'
import BackBtn from '@/components/backbtn'
import { getModuleMCQsByModuleId } from '@/data/mcq'
import { MCQDataTable } from '@/components/mcq/mcq-table/mc-data-table'
import { columns } from '@/components/mcq/mcq-table/mc-columns'
import AddMCQForm from '@/components/mcq/mcq-add-form'
import MExport from '@/export/module-export/module-export-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UploadCloud } from 'lucide-react'

async function fetchModule(mid: string) {
    const modulez = await getModuleById(mid)
    return modulez
}
async function fetchModuleMCQs(mid: string) {
    const modulex = await getModuleMCQsByModuleId(mid)
    return modulex
}

const ViewModule = async ({ params }: { params: Promise<{ cid: string; mid: string}> }) => {
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
                        {/* <Button className="bg-green-500 hover:bg-green-700 text-white"> <Puzzle className="mr-2" /> Add MCQ</Button> */}
                        <Link href={`/admin/courses/${cid}/modules/${mid}/mcq/import`}>
                            <Button>
                                <UploadCloud className="mr-2" />
                                Bulk Upload
                            </Button>
                        </Link>
                        <AddMCQForm mid={mid} aid={""} mcqtype='module' />
                        <MExport data={mcqData} fileName={`${modulez?.title}-MCQ.csv`} />
                        <BackBtn />
                    </div>
                </div>
                <MCQDataTable data={mcqData} columns={columns} />
            </div>
        </>
    )
}

export default ViewModule
