"use server"

import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddQuestionSchema, DeleteQuestionSchema, QuestionUpdateSchema } from "@/schemas/question-schema"

export const addquestion = async (
    values: z.infer<typeof AddQuestionSchema>
) => {
    await db.codeQuestion.create({
        data: {
            ...values,
        }
    })

    revalidatePath("/admin/questions")
    return { success: "Question Added !" }
}

export const deletequestion = async (
    values: z.infer<typeof DeleteQuestionSchema>
) => {
    const qid = values.id;
    await db.codeQuestion.delete({
        where: {
            id: qid
        }
    })
    revalidatePath("/admin/questions")
    return { success: "Question Deleted !" }
}

export const updatequestion = async (
    values: z.infer<typeof QuestionUpdateSchema>
) => {
    const qid = values.id;
    await db.codeQuestion.update({
        where: {
            id: qid
        },
        data: {
            ...values,
        }
    })
    revalidatePath("/admin/questions")
    return { success: "Question Updated !" }
}
