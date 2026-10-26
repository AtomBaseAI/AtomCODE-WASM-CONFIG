"use server"
import { db } from "@/lib/db"
import { UserMCQDataSchema } from "@/schemas/student/usersavemcq-schema"
import { revalidatePath } from "next/cache"


import * as z from 'zod'

export const submitmcq = async (values: z.infer<typeof UserMCQDataSchema>) => {
    const validatedFields = UserMCQDataSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid Submission" }
    }
    const {
        userId,
        moduleId,
        score,
        errors,
        submissiontype,
        tabswitches,
        status,
        duration
    } = validatedFields.data;

    const existingRecord = await db.userMCQData.findFirst({
        where: {
            userId,
            moduleId
        }
    })

    if (existingRecord) {
        return { warning: "Test Already Submitted !" }
    }

    await db.userMCQData.create({
        data: {
            userId,
            moduleId,
            score,
            errors,
            submissiontype,
            tabswitches,
            status,
            duration
        }
    })

    revalidatePath('/student/practice')
    return { success: "Submission Completed!" }
}
