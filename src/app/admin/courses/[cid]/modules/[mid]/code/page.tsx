import { Button } from '@/components/ui/button'
import { getModuleById, getModuleQuestionsByModuleId } from '@/data/modules'
import Link from 'next/link'
import React from 'react'
import { MQuestionDataTable } from "@/components/module-questions/module-question-table/mq-data-table"
import { columns } from "@/components/module-questions/module-question-table/mq-columns"
import { Package, Plus } from "lucide-react"
import BackBtn from '@/components/backbtn'
import MExport from '@/export/module-export/module-export-button'

async function fetchModule(mid: string) {
    const modulez = await getModuleById(mid)
    return modulez
}
async function fetchModuleQuestions(mid: string) {
    const modulex = await getModuleQuestionsByModuleId(mid)
    return modulex
}

const ViewModule = async ({ params }: { params: Promise<{ cid: string; mid: string}> }) => {
    const { cid, mid } = await params
    // const moduleId = parseInt(mid, 10);
    const modulez = await fetchModule(mid)
    const modulex = await fetchModuleQuestions(mid)
    const questionsData = modulex || [];
    // console.log(questionsData)

    const exportData = questionsData.map((question) => ({
        ID: question.id,
        Title: question.title,
        Description: question.description,
        Topic: question.topic,
        SubTopic: question.subtopic,
        SampleInput1: question.sampleinput1,
        SampleInput2: question.sampleinput2,
        SampleOutput1: question.sampleoutput1,
        SampleOutput2: question.sampleoutput2,
        Input1: question.input1,
        Input2: question.input2,
        Input3: question.input3,
        Output1: question.output1,
        Output2: question.output2,
        Output3: question.output3,
        MaxScore: question.maxscore,
        Difficulty: question.difficulty,
        Language: question.lang,
        InputConstrains: question.inputconstrains,
        Sourcecode: question.sourcecode,
        Blaklist: question.blacklist,
        Whitelist: question.whitelist,
        SoureCode: question.sourcecode
    }));
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {modulez?.title}
                        </h2>
                        <p className="text-muted-foreground">
                            Module Problems : {modulex?.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <Link href={`/admin/courses/${cid}/modules/${mid}/code/add`}>
                            <Button className="bg-green-500 hover:bg-green-700 text-white"> <Package className="mr-2" /> Add Questions</Button>
                        </Link>

                        <MExport data={exportData} fileName={`${modulez?.title}-Code.csv`} />
                        <BackBtn />
                    </div>
                </div>
                <MQuestionDataTable data={questionsData.map(question => ({
                    ...question,
                    topic: question.topic || '',
                    subtopic: question.subtopic || '',
                    input3: question.input3 || '',
                    inputconstrains: question.inputconstrains || '',
                    output3: question.output3 || undefined || '',
                    blacklist: question.blacklist || undefined || '',
                    whitelist: question.whitelist || undefined || ''
                }))} columns={columns} />
            </div>
        </>
    )
}

export default ViewModule