"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddModuleReferenceSchema, UpdateModuleReferenceSchema } from "@/schemas/references-schema"

export const addmodulereference = async (values: z.infer<typeof AddModuleReferenceSchema>) => {
    await db.moduleReferences.create({
        data: {
            ...values,
        }
    })

    revalidatePath(`/admin/courses`)
    revalidatePath(`/staff/courses`)
    return { success: "Reference Added !" }
}

export const updatemodulereference = async (
    values: z.infer<typeof UpdateModuleReferenceSchema>
) => {
    const rid = values.id;
    await db.moduleReferences.update({
        where: {
            id: rid
        },
        data: {
            ...values,
        }
    })
    revalidatePath("/admin/courses")
    revalidatePath("/staff/courses")
    return { success: "Reference Updated !" }
}

export const deletemodulereference = async (
    rid: string
) => {
    await db.moduleReferences.delete({
        where: {
            id: rid
        }
    })
    revalidatePath("/admin/courses")
    revalidatePath("/staff/courses")
    return { success: "Reference Deleted !" }
}