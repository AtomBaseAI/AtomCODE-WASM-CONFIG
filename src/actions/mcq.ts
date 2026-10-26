"use server";

import Papa from "papaparse";
import { db } from "@/lib/db";
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { AddMCQSchema, BulkImportMCQSchema, DeleteMCQSchema, MCQUpdateSchema } from "@/schemas/mcq-schema";

export const addMCQ = async (
    values: z.infer<typeof AddMCQSchema>,
    mcqtype: string
) => {
    const parsedData = {
        title: values.title,
        description: values.description,
        Option1: values.Option1,
        Option2: values.Option2,
        Option3: values.Option3,
        Option4: values.Option4,
        CorrectOption: values.CorrectOption,
        referenceimg: values.referenceimg,
        codesnippet: values.codesnippet,
        iscodesnippet: values.iscodesnippet,
        topic: values.topic,
        subtopic: values.subtopic,
    };

    if (mcqtype === "module" && values.moduleId) {
        await db.mCQQuestion.create({
            data: {
                ...parsedData,
                module: {
                    connect: { id: values.moduleId },
                },
            },
        });
    } else if (mcqtype === "assessment" && values.assessmentId) {
        await db.mCQQuestion.create({
            data: {
                ...parsedData,
                Assessments: {
                    connect: { id: values.assessmentId },
                },
            },
        });
    } else {
        throw new Error("Missing moduleId or assessmentsId for the selected type");
    }

    await revalidatePath("/admin/courses");
    return { success: "MCQ Added!" };
};

export const deleteMCQ = async (
    values: z.infer<typeof DeleteMCQSchema>
) => {
    const mcqId = values.id;
    await db.mCQQuestion.delete({
        where: {
            id: mcqId
        }
    });

    revalidatePath("/admin/courses");
    return { success: "MCQ Deleted!" };
}

export const updateMCQ = async (
    values: z.infer<typeof MCQUpdateSchema>
) => {
    const mcqId = values.id;
    await db.mCQQuestion.update({
        where: {
            id: mcqId
        },
        data: {
            ...values,
        }
    });

    revalidatePath("/admin/courses");
    return { success: "MCQ Updated!" };
}

// export const importmcqs = async (csvData: string, mid: string, aid: string, mcqtype: string) => {
//     const parsedData = Papa.parse(csvData, {
//         header: true,
//         skipEmptyLines: true,
//     });
//     const rawData = parsedData.data;

//     const mcqdata = rawData.map((row: any) => ({
//         moduleId: row.moduleId || mid || null,
//         assessmentsId: row.assessmentsId || aid || null,
//         title: row.title?.trim(),
//         description: row.description?.trim(),
//         Option1: row.Option1?.trim(),
//         Option2: row.Option2?.trim(),
//         Option3: row.Option3?.trim(),
//         Option4: row.Option4?.trim(),
//         CorrectOption: parseInt(row.CorrectOption, 10),
//         referenceimg: row.referenceimg || null,
//         codesnippet: row.codesnippet || null,
//         iscodesnippet: row.iscodesnippet === "true",
//         topic: row.topic?.trim() || null,
//         subtopic: row.subtopic?.trim() || null,
//     }));

//     const validationResult = BulkImportMCQSchema.safeParse(mcqdata);
//     if (!validationResult.success) {
//         console.error("Validation Errors:", validationResult.error.issues);
//         return { error: "Invalid data in the CSV file", issues: validationResult.error.issues };
//     }

//     const mcqs = validationResult.data;

//     try {
//         await db.mCQQuestion.createMany({
//             data: mcqs,
//         });
//         revalidatePath("/admin/courses");
//         return { success: "All MCQs imported successfully!" };
//     } catch (error) {
//         console.error("Database Error:", error);
//         return { error: "Failed to import MCQs due to a database error" };
//     }
// };
export const importmcqs = async (csvData: string, mid: string, aid: string, mcqtype: string) => {
    const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
    });
    const rawData = parsedData.data;

    const mcqdata = rawData.map((row: any) => ({
        title: row.title?.trim(),
        description: row.description?.trim(),
        Option1: row.Option1?.trim(),
        Option2: row.Option2?.trim(),
        Option3: row.Option3?.trim(),
        Option4: row.Option4?.trim(),
        CorrectOption: parseInt(row.CorrectOption, 10),
        referenceimg: row.referenceimg || null,
        codesnippet: row.codesnippet || null,
        iscodesnippet: row.iscodesnippet === "true",
        topic: row.topic?.trim() || null,
        subtopic: row.subtopic?.trim() || null,
    }));

    const validationResult = BulkImportMCQSchema.safeParse(mcqdata);
    if (!validationResult.success) {
        console.error("Validation Errors:", validationResult.error.issues);
        return {
            error: "Invalid data in the CSV file",
            issues: validationResult.error.issues,
        };
    }

    const mcqs = validationResult.data;

    try {
        for (const mcq of mcqs) {
            const data: any = {
                title: mcq.title,
                description: mcq.description,
                Option1: mcq.Option1,
                Option2: mcq.Option2,
                Option3: mcq.Option3,
                Option4: mcq.Option4,
                CorrectOption: mcq.CorrectOption,
                referenceimg: mcq.referenceimg,
                codesnippet: mcq.codesnippet,
                iscodesnippet: mcq.iscodesnippet,
                topic: mcq.topic,
                subtopic: mcq.subtopic,
            };

            if (mcqtype === "module") {
                data.module = { connect: { id: mid } };
            } else if (mcqtype === "assessment") {
                data.Assessments = { connect: { id: aid} };
            }
            // console.log(data)
            await db.mCQQuestion.create({ data });
        }

        await revalidatePath("/admin/courses");
        return { success: "All MCQs imported successfully!" };
    } catch (error) {
        console.error("Database Error:", error);
        return { error: "Failed to import MCQs due to a database error" };
    }
};
