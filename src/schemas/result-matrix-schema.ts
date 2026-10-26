import * as z from "zod"

export const ModuleDataSchema = z.object({
    modulename: z.string(),
    mcqscore: z.number(),
    codescore: z.number(),
    totalscore: z.number(),
    maxscore: z.number(),
    errors: z.number(),
    compiles: z.number(),
    time: z.number()
})

export const StudentDataSchema = z.object({
    studentname: z.string(),
    rollnumber: z.string(),
    department: z.string(),
    batch: z.string(),
    section: z.string(),
    email: z.string(),
    completionpercentage: z.number(),
    moduledata: z.array(ModuleDataSchema)
})

export type ResultTableStudentType = z.infer<typeof StudentDataSchema>
export type ResultTableModuleType = z.infer<typeof ModuleDataSchema>