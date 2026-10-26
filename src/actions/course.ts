"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddCourseSchema, CourseUpdateSchema, DeleteCourseSchema } from "@/schemas/course-schema"

export const addcourse = async (values: z.infer<typeof AddCourseSchema>) => {
    await db.course.create({
        data: {
            ...values,
        }
    })

    revalidatePath("/admin/courses")
    return { success: "Course Added !" }
}
export const deletecourse = async (
    values: z.infer<typeof DeleteCourseSchema>
) => {
    const cid = values.id;
    await db.course.delete({
        where: {
            id: cid
        }
    })
    revalidatePath("/admin/courses")
    return { success: "Course Deleted !" }
}

export const updatecourse = async (
    values: z.infer<typeof CourseUpdateSchema>
) => {
    const cid = values.id;
    await db.course.update({
        where: {
            id: cid
        },
        data: {
            ...values,
        }
    })
    revalidatePath("/admin/courses")
    return { success: "Course Updated !" }
}

