import { z } from "zod"
import { Button } from '@/components/ui/button'
import { getModuleById, getModuleQuestionsByModuleId } from '@/data/modules'
import { ModuleQuestionTableSchema, ModuleTableSchema } from '@/schemas/module-schema'
import Link from 'next/link'
import React from 'react'
import { getAllQuestionsByLang } from "@/data/questions"
import { QuestionTableSchema } from "@/schemas/question-schema"
import { MQuestionAddDataTable } from "@/components/module-questions/module-question-add-table/mqa-data-table"
import { columns } from "@/components/module-questions/module-question-add-table/mqa-columns"
import { MQADataTableToolbar } from "@/components/module-questions/module-question-add-table/mqa-data-table-toolbar"
import BackBtn from "@/components/backbtn"

async function fetchModule(mid: string) {
    const modulez = await getModuleById(mid)
    const moduleWithQuestions = {
        ...modulez,
        questions: []
    }
    return ModuleQuestionTableSchema.parse(moduleWithQuestions);
}
async function fetchmodulequestions(mid: string) {
    const modulezQuestions = await getModuleQuestionsByModuleId(mid);
    return modulezQuestions
}
async function fetchQestoinbyLang(lang: string) {
    const langquestions = await getAllQuestionsByLang(lang)
    return langquestions;
}
const AddModuleQuestions = async ({ params }: { params: Promise<{ cid: string; mid: string}> }) => {
    const { cid, mid } = await params
    const modulez = await fetchModule(mid)
    const moduleq = await fetchmodulequestions(mid)
    const questionsLang = await fetchQestoinbyLang(modulez.language)

    if (questionsLang === null) {
        return <p>No questions available for this language.</p>;
    }

    const filteredQuestions = questionsLang.filter(question => {
        return !moduleq?.some(moduleQuestion => moduleQuestion.id === question.id);
    });

    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {modulez?.title}
                        </h2>
                        <p className="text-muted-foreground flex items-center justify-center">
                            Add new Questions
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>

                <MQuestionAddDataTable data={filteredQuestions} columns={columns} mid={mid} />
            </div>
        </>
    )
}

export default AddModuleQuestions