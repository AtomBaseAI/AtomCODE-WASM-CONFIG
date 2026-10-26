import * as z from "zod"


export const AddCourseSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required"
    }),
    startdate: z.date(),
    enddate: z.date(),
    language: z.string().min(1, {
        message: "Language is required"
    }),
});

export const DeleteCourseSchema = z.object({
    id: z.string()
})

export const CourseTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    startdate: z.date(),
    enddate: z.date(),
    language: z.string(),
    modulescount: z.number(),
    assessmentscount: z.number()
})


export const CourseUpdateSchema = z.object({
    id: z.string(),
    title: z.string(),
    startdate: z.date(),
    enddate: z.date(),
    language: z.string(),
})




export type CourseTableType = z.infer<typeof CourseTableSchema>

