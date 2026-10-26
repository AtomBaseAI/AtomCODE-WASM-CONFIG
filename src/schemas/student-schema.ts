import * as z from "zod"

export const AddStudentSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required"
    }),
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required"
    }),
    rollnumber: z.string().min(1, {
        message: "Rollnumber is required"
    }),
    department: z.string().min(1, {
        message: "Departmnet is required"
    }),
    section: z.string().min(1, {
        message: "Section is required",
    }),
    batch: z.string().min(1, {
        message: "Batch is required"
    })
});

export const DeleteStudentSchema = z.object({
    id: z.string()
})
export const DeleteCourseStudentSchema = z.object({
    uid: z.string(),
    cid: z.string()
})

export const StudentTableSchema = z.object({
    id: z.string(),
    rollnumber: z.string().nullable(),
    name: z.string(),
    email: z.string(),
    department: z.string().nullable(),
    section: z.string().nullable(),
    batch: z.string().nullable(),
    github: z.string().nullable(),
    isActive: z.boolean(),
})


export const StudentUpdateSchema = z.object({
    id: z.string(),
    rollnumber: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    department: z.string(),
    section: z.string(),
    batch: z.string(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    isActive: z.boolean(),

})

export const StudentPasswordResetSchema = z.object({
    id: z.string(),
    password: z.string().optional()
})

export const ImportStudentSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    email: z.string().email({
        message: "Email is required",
    }),
    rollnumber: z.string().min(1, {
        message: "Rollnumber is required",
    }),
    department: z.string().min(1, {
        message: "Department is required",
    }),
    section: z.string().min(1, {
        message: "Section is required",
    }),
    batch: z.string().min(1, {
        message: "Batch is required",
    }),
});

export const BulkImportStudentsSchema = z.array(ImportStudentSchema);

export type BulkImportStudentsType = z.infer<typeof BulkImportStudentsSchema>;

export type StudentTableType = z.infer<typeof StudentTableSchema>

