"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
export const addcoursestaffs = async (
    courseId: string,
    studentIds: string[]
) => {
    try {
        await db.staffCourse.createMany({
            data: studentIds.map(staffId => ({
                staffId,
                courseId,
                active: true
            }))
        });
        revalidatePath(`/admin/courses/`);
        return { success: "Staffs added to Course successfully!" };
    } catch (error) {
        console.error("Error adding Staffs to course:", error);
        throw error;
    }
}

export const deletecoursestaff = async (
    uid: string,
    cid: string
) => {
    try {
        const existingRecord = await db.staffCourse.findFirst({
            where: {
                courseId: cid,
                staffId: uid
            }
        });

        if (!existingRecord) {
            throw new Error("Record to delete does not exist.");
        }

        await db.staffCourse.delete({
            where: {
                id: existingRecord.id
            }
        });

        revalidatePath(`/admin/courses`);
        return { success: "Staff deleted from course successfully!" };
    } catch (error) {
        console.error("Error deleting Staff from course:", error);
        throw error;
    }
}

export const getstaffsbycourseid = async (courseId: string) => {
    try {
        const courseStaffs = await db.staffCourse.findMany({
            where: { courseId },
            include: { staff: true }
        });

        if (!courseStaffs) {
            return null;
        }

        return courseStaffs.map(courseStaff => courseStaff.staff);
    } catch (error) {
        console.error("Error fetching staffs by course ID:", error);
        return null;
    }
};
