"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/action-guards"
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

export const deletemodulesbulk = async (ids: string[]) => {
    const session = await requireAdmin();
    if (!session) return { error: "Only admins can delete modules." };

    const validIds = (ids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No modules selected." };

    // Modules referenced by questions/attempts cannot be deleted (FK
    // restrict) — delete what we can and report the rest as skipped.
    let deleted = 0;
    let skipped = 0;
    for (const id of validIds) {
        try {
            await db.module.delete({ where: { id } });
            deleted++;
        } catch {
            skipped++;
        }
    }

    revalidatePath("/admin/courses");
    revalidatePath("/staff/courses");

    if (deleted === 0) {
        return {
            error:
                "None of the selected modules could be deleted — they still contain questions or student attempts.",
        };
    }
    return { success: `${deleted} module(s) deleted.`, skipped: skipped > 0 ? skipped : undefined };
}

/**
 * Bulk-remove code questions from a module (the questions themselves stay
 * in the question bank — mirrors the row-level disconnect behaviour).
 */
export const deletemodulequestionsbulk = async (mid: string, qids: string[]) => {
    const session = await requireAdmin();
    if (!session) return { error: "Only admins can manage module questions." };

    const validIds = (qids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No questions selected." };

    const module_ = await db.module.findUnique({
        where: { id: mid },
        select: { codeQuestions: { select: { id: true } } },
    });
    if (!module_) return { error: "Module not found." };

    const connectedIds = module_.codeQuestions
        .map((q) => q.id)
        .filter((id) => validIds.includes(id));
    if (connectedIds.length === 0) {
        return { error: "Selected questions are not part of this module." };
    }

    await db.module.update({
        where: { id: mid },
        data: {
            codeQuestions: {
                disconnect: connectedIds.map((id) => ({ id })),
            },
        },
    });

    revalidatePath("/admin/courses");
    return { success: `${connectedIds.length} question(s) removed from the module.` };
}