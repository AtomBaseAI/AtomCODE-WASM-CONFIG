"use server"
import Papa from "papaparse";
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddStudentSchema, BulkImportStudentsSchema, DeleteStudentSchema, StudentPasswordResetSchema, StudentUpdateSchema } from "@/schemas/student-schema"
import { genSaltSync, hashSync } from 'bcrypt-ts';

export const addstudent = async (values: z.infer<typeof AddStudentSchema>) => {
    const validatedFields = AddStudentSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid email/password" }
    }
    const { email, password, name, department, rollnumber, batch, section } = validatedFields.data;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    // const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await db.user.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        return { error: "Email already exists !" }
    }

    await db.user.create({
        data: {
            name,
            email,
            department,
            rollnumber,
            batch,
            section,
            isTwoFactorEnabled: false,
            password: hashedPassword
        }
    })
    revalidatePath("/admin/students")
    return { success: "Student Added !" }

}

export const deletestudent = async (
    values: z.infer<typeof DeleteStudentSchema>
) => {
    const uid = values.id;
    await db.user.delete({
        where: {
            id: uid
        }
    })
    revalidatePath("/admin/students")
    return { success: "Student Deleted !" }
}


export const updatestudent = async (
    values: z.infer<typeof StudentUpdateSchema>
) => {
    const uid = values.id;
    await db.user.update({
        where: {
            id: uid
        },
        data: {
            ...values,
        }
    })

    revalidatePath("/admin/students")
    // revalidatePath("student")
    return { success: "Student Updated !" }
}


export const resetpasswordstudent = async (
    values: z.infer<typeof StudentPasswordResetSchema>
) => {
    const uid = values.id;
    const password = "User@Atom"
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    // const hashedPassword = await bcrypt.hash(password, 10)
    await db.user.update({
        where: {
            id: uid
        },
        data: {
            password: hashedPassword
        }
    })
    return { success: "Default Password Updated !" }
}



export const importstudents = async (csvData: string) => {

    const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
    });

    const validationResult = BulkImportStudentsSchema.safeParse(parsedData.data);

    if (!validationResult.success) {
        return { error: "Invalid data in the CSV file" };
    }

    const students = validationResult.data;

    // const defaultPassword = await bcrypt.hash("User@Atom", 10);
    const salt = genSaltSync(10);
    const defaultPassword = hashSync("User@Atom", salt);
    for (const student of students) {
        const existingUser = await db.user.findUnique({
            where: { email: student.email },
        });

        if (existingUser) {
            return { error: `Email already exists: ${student.email}` };
        }

        await db.user.create({
            data: {
                ...student,
                password: defaultPassword,
                isTwoFactorEnabled: false,
            },
        });
    }

    revalidatePath("/admin/students")
    return { success: "All students imported successfully!" };
};