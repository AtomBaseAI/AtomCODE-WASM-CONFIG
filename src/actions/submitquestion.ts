"use server"
import { db } from "@/lib/db"
import { UserQuestionDataSchema } from "@/schemas/student/usersavequestion-schema"
import { revalidatePath } from "next/cache"

import * as z from 'zod'

export const submitquestion = async (values: z.infer<typeof UserQuestionDataSchema>) => {
    const validatedFields = UserQuestionDataSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid Submission" }
    }
    const {
        userId,
        questionId,
        moduleId,
        score,
        compiles,
        errors,
        submissiontype,
        tabswitches,
        status,
        usercode,
        duration,
        testcase1status,
        testcase2status,
        testcase3status,
    } = validatedFields.data;
    const existingrecord = await db.userCodeQuestionData.findUnique({
        where: {
            userId_questionId: {
                userId: userId,
                questionId: questionId
            },
        },
    })
    if (existingrecord && existingrecord.status === 'retake') {
        await db.userCodeQuestionData.update({
            where: {
                id: existingrecord.id
            },
            data: {
                score,
                compiles,
                errors,
                tabswitches,
                status,
                usercode,
                duration,
                testcase1status,
                testcase2status,
                testcase3status,
            }
        })

        await revalidatePath('/student/practice');
        return { success: "Code Retake Submitted !" }
    } else if (existingrecord?.status === 'submitted') {
        return { error: "Code already Submitted !" }
    }
    await db.userCodeQuestionData.create({
        data: {
            userId,
            questionId,
            moduleId,
            score,
            compiles,
            errors,
            submissiontype,
            tabswitches,
            status,
            usercode,
            duration,
            testcase1status,
            testcase2status,
            testcase3status,
        }
    })

    await revalidatePath('/student/practice');
    return { success: "Code Submitted !" }
}

export const submitcode = async () => {
    await revalidatePath('/student/practice');
    return { success: "Submission Completed !" }
}