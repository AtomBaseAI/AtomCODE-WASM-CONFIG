"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddModuleReferenceSchema, UpdateModuleReferenceSchema } from "@/schemas/references-schema"
import { auth } from "@/auth"

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

/**
 * Bulk-delete module references. Row-level deletes are already available to
 * both admins and staff, so the bulk action keeps the same policy — it only
 * requires an authenticated admin/staff session.
 */
export const deletereferencesbulk = async (ids: string[]) => {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || (role !== "admin" && role !== "staff")) {
        return { error: "You must be signed in to manage references." };
    }

    const validIds = (ids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No references selected." };

    const result = await db.moduleReferences.deleteMany({
        where: { id: { in: validIds } },
    });
    revalidatePath("/admin/courses");
    revalidatePath("/staff/courses");
    return { success: `${result.count} reference(s) deleted.` };
}