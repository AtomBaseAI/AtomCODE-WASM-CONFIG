"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddModuleSchema, DeleteModuleSchema, ModuleUpdateSchema } from "@/schemas/module-schema"

export const addmodule = async (values: z.infer<typeof AddModuleSchema>) => {
    const cid = values.courseId;
    await db.module.create({
        data: {
            ...values,
        }
    })

    revalidatePath(`/admin/courses`)
    return { success: "Module Added !" }
}
export const deletemodule = async (
    values: z.infer<typeof DeleteModuleSchema>
) => {
    const mid = values.id;
    await db.module.delete({
        where: {
            id: mid
        }
    })
    revalidatePath("/admin/courses")
    return { success: "Module Deleted !" }
}



//change model before update
export const updatemodule = async (
    values: z.infer<typeof ModuleUpdateSchema>
) => {
    const mid = values.id;
    await db.module.update({
        where: {
            id: mid
        },
        data: {
            ...values,
        }
    })
    revalidatePath(`/admin/courses`)
    return { success: "Module Updated !" }
}

export const addmodulequestions = async (
    moduleId: string,
    questionIds: string[]
) => {
    await db.module.update({
        where: {
            id: moduleId
        },
        data: {
            codeQuestions: {
                connect: questionIds.map(id => ({ id }))
            }
        }
    });

    revalidatePath(`/admin/courses`)
    return { success: "Questions added to module successfully!" };
}

export const deletemodulequestionx = async (
    id: string,
    mid: string
) => {
    await db.module.update({
        where: {
            id: mid
        },
        data: {
            codeQuestions: {
                disconnect: { id: id }
            }
        }
    });

    revalidatePath(`/admin/courses`)
    return { success: "Question deleted from module successfully!" };
}