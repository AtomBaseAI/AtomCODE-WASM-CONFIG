"use server"
import Papa from "papaparse";
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { AddStaffSchema, DeleteStaffSchema, StaffPasswordResetSchema, StaffUpdateSchema } from "@/schemas/staff-schema"
import { genSaltSync, hashSync } from 'bcrypt-ts';

export const addstaff = async (values: z.infer<typeof AddStaffSchema>) => {
    const validatedFields = AddStaffSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid email/password" }
    }
    const { email, password, name, department, staffnumber, phone } = validatedFields.data;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    const existingUser = await db.staff.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        return { error: "Email already exists !" }
    }

    await db.staff.create({
        data: {
            name,
            email,
            department,
            staffnumber,
            phone,
            password: hashedPassword
        }
    })
    revalidatePath("/admin/staffs")
    return { success: "Staff Added !" }

}

export const deletestaff = async (
    values: z.infer<typeof DeleteStaffSchema>
) => {
    const uid = values.id;
    await db.staff.delete({
        where: {
            id: uid
        }
    })
    revalidatePath("/admin/staffs")
    return { success: "Staff Deleted !" }
}


export const updatestaff = async (
    values: z.infer<typeof StaffUpdateSchema>
) => {
    const uid = values.id;
    await db.staff.update({
        where: {
            id: uid
        },
        data: {
            ...values,
        }
    })

    revalidatePath("/admin/staffs")
    // revalidatePath("student")
    return { success: "Staff Updated !" }
}


export const resetpasswordstaff = async (
    values: z.infer<typeof StaffPasswordResetSchema>
) => {
    const uid = values.id;
    const password = "Staff@Atom"
    // const hashedPassword = await bcrypt.hash(password, 10)

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await db.staff.update({
        where: {
            id: uid
        },
        data: {
            password: hashedPassword
        }
    })
    return { success: "Default Password Updated !" }
}


