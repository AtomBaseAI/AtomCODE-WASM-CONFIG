import * as z from "zod"

export const AddStaffSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required"
    }),
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required"
    }),
    staffnumber: z.string().min(1, {
        message: "Rollnumber is required"
    }),
    department: z.string().min(1, {
        message: "Departmnet is required"
    }),
    phone: z.string().min(1, {
        message: "Phone is required"
    }),
});

export const DeleteStaffSchema = z.object({
    id: z.string()
})
export const DeleteCourseStaffSchema = z.object({
    sid: z.string(),
    cid: z.string()
})

export const StaffTableSchema = z.object({
    id: z.string(),
    staffnumber: z.string().nullable(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    department: z.string().nullable(),
})


export const StaffUpdateSchema = z.object({
    id: z.string(),
    staffnumber: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    department: z.string()

})

export const StaffPasswordResetSchema = z.object({
    id: z.string(),
    password: z.string().optional()
})



export type StaffTableType = z.infer<typeof StaffTableSchema>

