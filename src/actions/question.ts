"use server"

import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddQuestionSchema, DeleteQuestionSchema, QuestionUpdateSchema } from "@/schemas/question-schema"
import { requireAdmin } from "@/lib/action-guards"

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

export const deletequestionsbulk = async (ids: string[]) => {
    const session = await requireAdmin();
    if (!session) return { error: "Only admins can delete questions." };

    const validIds = (ids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No questions selected." };

    const result = await db.codeQuestion.deleteMany({
        where: { id: { in: validIds } },
    });
    revalidatePath("/admin/questions");
    return { success: `${result.count} question(s) deleted.` };
}
