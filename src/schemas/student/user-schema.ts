import * as z from "zod"

export const StudentUpdateSchema = z.object({
    id: z.string(),
    rollnumber: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    department: z.string(),
    section: z.string(),
    batch: z.string(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
})

// export const StudentPasswordResetSchema = z.object({
//     id: z.string(),
//     password: z.string().min(6, {
//         message: "Minimum 6 characters required"
//     }),
//     confirmpassword: z.string().min(6, {
//         message: "Minimum 6 characters required"
//     })
// })


export const StudentPasswordResetSchema = z.object({
    id: z.string(),
    password: z.string().min(6, {
        message: "Minimum 6 characters required"
    }),
    confirmpassword: z.string().min(6, {
        message: "Minimum 6 characters required"
    })
}).refine((data) => data.password === data.confirmpassword, {
    path: ['confirmpassword'],
    message: "Passwords do not match"
});