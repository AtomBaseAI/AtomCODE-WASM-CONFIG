"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddFeedbackSchema, UpdateFeedbackSchema } from "@/schemas/feedback-schema"
import { auth } from "@/auth"

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

/**
 * Bulk-delete feedbacks. Row-level deletes are already available to both
 * admins and staff, so the bulk action keeps the same policy — it only
 * requires an authenticated admin/staff session.
 */
export const deletefeedbacksbulk = async (ids: string[]) => {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || (role !== "admin" && role !== "staff")) {
        return { error: "You must be signed in to manage feedbacks." };
    }

    const validIds = (ids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No feedbacks selected." };

    const result = await db.feedbacks.deleteMany({
        where: { id: { in: validIds } },
    });
    revalidatePath("/admin/courses");
    revalidatePath("/staff/courses");
    return { success: `${result.count} feedback(s) deleted.` };
}