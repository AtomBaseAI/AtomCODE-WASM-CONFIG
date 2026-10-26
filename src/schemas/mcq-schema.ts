import * as z from "zod";

export const AddMCQSchema = z.object({


    title: z.string().min(1, {
        message: "Title is required"
    }),
    description: z.string().min(1, {
        message: "Description is required"
    }),
    Option1: z.string().min(1, {
        message: "Option 1 is required"
    }),
    Option2: z.string().min(1, {
        message: "Option 2 is required"
    }),
    Option3: z.string().min(1, {
        message: "Option 3 is required"
    }),
    Option4: z.string().min(1, {
        message: "Option 4 is required"
    }),
    CorrectOption: z.number().int().min(1).max(4, {
        message: "Correct Option must be between 1 and 4"
    }),
    referenceimg: z.string().optional(),
    codesnippet: z.string().optional(),
    iscodesnippet: z.boolean(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    moduleId: z.string().optional().nullable(),
    assessmentId: z.string().optional().nullable(),
})

export const DeleteMCQSchema = z.object({
    id: z.string()
});

export const MCQTableSchema = z.object({
    id: z.string(),
    moduleId: z.string().optional().nullable(),
    assessmentId: z.string().optional().nullable(),
    title: z.string(),
    description: z.string(),
    Option1: z.string(),
    Option2: z.string(),
    Option3: z.string(),
    Option4: z.string(),
    CorrectOption: z.number().int(),
    referenceimg: z.string().optional(),
    codesnippet: z.string().optional(),
    iscodesnippet: z.boolean(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
});

export const MCQUpdateSchema = z.object({
    id: z.string(),
    moduleId: z.string().optional().nullable(),
    assessmentId: z.string().optional().nullable(),
    title: z.string().min(1, {
        message: "Title is required"
    }),
    description: z.string().min(1, {
        message: "Description is required"
    }),
    Option1: z.string().min(1, {
        message: "Option 1 is required"
    }),
    Option2: z.string().min(1, {
        message: "Option 2 is required"
    }),
    Option3: z.string().min(1, {
        message: "Option 3 is required"
    }),
    Option4: z.string().min(1, {
        message: "Option 4 is required"
    }),
    CorrectOption: z.number().int().min(1).max(4, {
        message: "Correct Option must be between 1 and 4"
    }),
    referenceimg: z.string().optional(),
    codesnippet: z.string().optional(),
    iscodesnippet: z.boolean(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
});
export const ImportMCQSchema = z.object({
    moduleId: z.string().optional().nullable(),
    assessmentId: z.string().optional().nullable(),
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    Option1: z.string().min(1, { message: "Option 1 is required" }),
    Option2: z.string().min(1, { message: "Option 2 is required" }),
    Option3: z.string().min(1, { message: "Option 3 is required" }),
    Option4: z.string().min(1, { message: "Option 4 is required" }),
    CorrectOption: z.number().int().min(1).max(4, { message: "Correct Option must be between 1 and 4" }),
    referenceimg: z.string().optional().nullable(),
    codesnippet: z.string().optional().nullable(),
    iscodesnippet: z.boolean(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
});

export const BulkImportMCQSchema = z.array(ImportMCQSchema);
export type MCQTableType = z.infer<typeof MCQTableSchema>;
