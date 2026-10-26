"use server"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import { StudentPasswordResetSchema, StudentUpdateSchema } from "@/schemas/student/user-schema"
import { genSaltSync, hashSync } from 'bcrypt-ts';
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

    revalidatePath("/")
    return { success: "Student Updated !" }
}
export const resetpasswordstudent = async (
    values: z.infer<typeof StudentPasswordResetSchema>
) => {
    const uid = values.id;
    const password = values.password;
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
    return { success: "Password Updated !" }

}
