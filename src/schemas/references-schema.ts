import * as z from "zod";

export const AddModuleReferenceSchema = z.object({
    moduleId: z.string(),
    title: z.string().min(1, {
        message: "Feedback link is required"
    }),
    link: z.string().min(1, {
        message: "Reference link is required"
    }),
    type: z.string().min(1, {
        message: "Reference type is required"
    })
});
export const UpdateModuleReferenceSchema = z.object({
    id: z.string(),
    title: z.string(),
    link: z.string(),
    type: z.string()
})
export const DeleteModuleReferenceSchema = z.object({
    id: z.string()
});

export const ModuleReferenceTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    // moduleId: z.number(),
    link: z.string(),
    type: z.string()
});

export type ModuleReferenceTableType = z.infer<typeof ModuleReferenceTableSchema>;