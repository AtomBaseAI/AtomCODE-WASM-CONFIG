"use server"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { AdminPasswordResetSchema } from "@/schemas/admin-schema"
import { genSaltSync, hashSync } from 'bcrypt-ts';

export const resetpasswordadmin = async (
    values: z.infer<typeof AdminPasswordResetSchema>
) => {
    const uid = values.id;
    const password = values.password;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    await db.admin.update({
        where: {
            id: uid
        },
        data: {
            password: hashedPassword
        }
    })
    return { success: "Password Updated !" }
}
