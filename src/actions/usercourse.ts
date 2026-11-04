"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { requireAdminOrCourseStaff } from "@/lib/action-guards"
export const addcoursestudents = async (
    courseId: string,
    studentIds: string[]
) => {
    try {
        await db.userCourse.createMany({
            data: studentIds.map(userId => ({
                userId,
                courseId,
                active: true,
                completionPercentage: 0
            }))
        });
        revalidatePath(`/admin/courses/`);
        return { success: "Students added to Course successfully!" };
    } catch (error) {
        console.error("Error adding Students to course:", error);
        throw error;
    }
}

export const deletecoursestudent = async (
    uid: string,
    cid: string
) => {
    try {
        const existingRecord = await db.userCourse.findFirst({
            where: {
                courseId: cid,
                userId: uid
            }
        });

        if (!existingRecord) {
            throw new Error("Record to delete does not exist.");
        }

        await db.userCourse.delete({
            where: {
                id: existingRecord.id
            }
        });

        revalidatePath(`/admin/courses`);
        return { success: "Student deleted from course successfully!" };
    } catch (error) {
        console.error("Error deleting student from course:", error);
        throw error;
    }
}

export const getstudentsbycourseid = async (courseId: string) => {
    try {
        const courseStudents = await db.userCourse.findMany({
            where: { courseId },
            include: { user: true }
        });

        if (!courseStudents) {
            return null;
        }

        return courseStudents.map(courseStudent => courseStudent.user);
    } catch (error) {
        console.error("Error fetching users by course ID:", error);
        return null;
    }
};

/**
 * Bulk-remove students from a course. Allowed for admins and for staff
 * assigned to the course (matches the row-level permission model).
 */
export const deletecoursestudentsbulk = async (
    uids: string[],
    cid: string
) => {
    const session = await requireAdminOrCourseStaff(cid);
    if (!session) {
        return { error: "You are not allowed to manage students of this course." };
    }

    const validIds = (uids ?? []).filter(
        (id) => typeof id === "string" && id.trim().length > 0
    );
    if (validIds.length === 0) return { error: "No students selected." };

    const result = await db.userCourse.deleteMany({
        where: { courseId: cid, userId: { in: validIds } },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/staff/courses/${cid}/students`);
    return { success: `${result.count} student(s) removed from the course.` };
}
