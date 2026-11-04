"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddCourseSchema, CourseUpdateSchema, DeleteCourseSchema } from "@/schemas/course-schema"
import { requireAdmin } from "@/lib/action-guards";

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

export const deletecoursesbulk = async (ids: string[]) => {
    const session = await requireAdmin();
    if (!session) return { error: "Only admins can delete courses." };

    const validIds = (ids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No courses selected." };

    // Courses referenced by modules/assessments/enrollments cannot be
    // deleted (FK restrict) — delete what we can and report the rest.
    let deleted = 0;
    let skipped = 0;
    for (const id of validIds) {
        try {
            await db.course.delete({ where: { id } });
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
                "None of the selected courses could be deleted — they still contain modules, assessments or enrollments.",
        };
    }
    return { success: `${deleted} course(s) deleted.`, skipped: skipped > 0 ? skipped : undefined };
}

