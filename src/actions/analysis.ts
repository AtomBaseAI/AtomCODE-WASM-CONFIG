"use server"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const resetModuleForStudent = async (
    uid: string,
    qid: string,
    mid: string,
    cid: string
) => {
    const userCodeQuestionData = await db.userCodeQuestionData.findFirst({
        where: {
            userId: uid,
            questionId: qid,
            moduleId: mid,
        },
    });

    const userModuleData = await db.userModuleData.findFirst({
        where: {
            userId: uid,
            courseId: cid,
            moduleId: mid,
        },
    });

    if (!userCodeQuestionData && !userModuleData) {
        return { error: "Not yet submitted" };
    }

    if (userCodeQuestionData) {
        await db.userCodeQuestionData.update({
            where: {
                id: userCodeQuestionData.id,
            },
            data: {
                status: "retake",
            },
        });
    }

    if (userModuleData) {
        await db.userModuleData.update({
            where: {
                id: userModuleData.id,
            },
            data: {
                modulestatus: "retake",
                questionstatus: "retake",
            },
        });
    }

    revalidatePath("/admin/results");
    revalidatePath("/staff/results");

    return { success: "Module reset successfully" };
};
