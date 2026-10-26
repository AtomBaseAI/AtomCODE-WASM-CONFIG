"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddFeedbackSchema, UpdateFeedbackSchema } from "@/schemas/feedback-schema"

export const addfeedback = async (values: z.infer<typeof AddFeedbackSchema>) => {
    const cid = values.courseId;
    await db.feedbacks.create({
        data: {
            ...values,
        }
    })

    revalidatePath(`/admin/courses`)
    revalidatePath(`/staff/courses`)
    return { success: "Feedback Added !" }
}

export const updatefeedback = async (
    values: z.infer<typeof UpdateFeedbackSchema>
) => {
    const fid = values.id;
    await db.feedbacks.update({
        where: {
            id: fid
        },
        data: {
            ...values,
        }
    })
    revalidatePath("/admin/courses")
    revalidatePath("/staff/courses")
    return { success: "Feedback Updated !" }
}

export const deletefeedback = async (
    fid: string
) => {
    await db.feedbacks.delete({
        where: {
            id: fid
        }
    })
    revalidatePath("/admin/courses")
    revalidatePath("/staff/courses")
    return { success: "Feedback Deleted !" }
}